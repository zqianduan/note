# Formily JSON Schema 设计详解

> @formily/json-schema 是 Formily 的核心库之一，提供了使用 JSON Schema 协议来描述表单结构的能力。它将表单从 JSX 命令式编程转换为 JSON 声明式配置，使得表单可以通过配置动态生成，非常适合低代码平台和配置化场景。

## 目录

- [1. 设计理念](#1-设计理念)
- [2. 核心类型：ISchema](#2-核心类型ischema)
- [3. createSchemaField 实现原理](#3-createschemafield-实现原理)
- [4. x-decorator 和 x-component 设计](#4-x-decorator-和-x-component-设计)
- [5. x-reactions 联动机制](#5-x-reactions-联动机制)
- [6. x-validator 校验设计](#6-x-validator-校验设计)
- [7. Schema 表达式系统](#7-schema-表达式系统)
- [8. 数组字段的 Schema 设计](#8-数组字段的-schema-设计)
- [9. 对象字段的 Schema 设计](#9-对象字段的-schema-设计)
- [10. void 字段的设计](#10-void-字段的设计)
- [11. 实战案例分析](#11-实战案例分析)

---

## 1. 设计理念

### 1.1 为什么需要 JSON Schema？

在 Formily 中，表单可以用两种方式定义：

**JSX 模式（命令式）**
```tsx
<Field
  name="username"
  title="用户名"
  required
  component={[Input]}
  decorator={[FormItem]}
/>
```

**JSON Schema 模式（声明式）**
```typescript
{
  type: 'string',
  title: '用户名',
  required: true,
  'x-component': 'Input',
  'x-decorator': 'FormItem'
}
```

JSON Schema 的优势：
1. **配置化**：可以将表单定义存储在数据库或配置文件中
2. **动态生成**：后端可以控制前端表单结构
3. **跨平台**：Schema 定义与框架无关，可以跨平台复用
4. **可视化编辑**：可以基于 Schema 构建表单设计器
5. **版本管理**：Schema 是纯 JSON，易于版本控制和 diff

### 1.2 设计原则

1. **标准兼容**：基于 [JSON Schema](https://json-schema.org/) 标准，扩展 Formily 专用字段
2. **类型安全**：使用 TypeScript 提供完整的类型定义
3. **表达式支持**：通过 `{{}}` 模板字符串支持动态计算
4. **递归结构**：支持无限层级嵌套
5. **可扩展性**：允许自定义扩展字段

---

## 2. 核心类型：ISchema

### 2.1 类型定义

```typescript
interface ISchema {
  // ===== JSON Schema 标准字段 =====
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'void'
  title?: string                    // 字段标题
  description?: string              // 字段描述
  default?: any                     // 默认值
  required?: boolean | string[]     // 是否必填
  enum?: Array<{ label: string; value: any }>  // 枚举值
  properties?: Record<string, ISchema>  // 子属性（用于 object）
  items?: ISchema                   // 数组项 Schema（用于 array）

  // ===== Formily 扩展字段 =====
  name?: string                     // 字段路径名称

  // 组件相关
  'x-component'?: string            // 渲染组件名称
  'x-component-props'?: any         // 组件 props
  'x-decorator'?: string            // 装饰器组件（如 FormItem）
  'x-decorator-props'?: any         // 装饰器 props

  // 联动相关
  'x-reactions'?: SchemaReactions   // 字段联动逻辑

  // 校验相关
  'x-validator'?: Validator[]       // 校验规则

  // 状态相关
  'x-visible'?: boolean             // 是否可见
  'x-hidden'?: boolean              // 是否隐藏（占位）
  'x-disabled'?: boolean            // 是否禁用
  'x-editable'?: boolean            // 是否可编辑
  'x-read-only'?: boolean           // 是否只读
  'x-read-pretty'?: boolean         // 是否阅读态

  // 数据相关
  'x-value'?: any                   // 字段值
  'x-data'?: any                    // 自定义数据
  'x-content'?: any                 // 内容（用于展示）

  // 其他
  'x-pattern'?: 'editable' | 'disabled' | 'readOnly' | 'readPretty'
  'x-display'?: 'visible' | 'hidden' | 'none'
}
```

### 2.2 字段类型说明

#### 2.2.1 基础类型

| type | 说明 | 示例场景 |
|------|------|----------|
| `string` | 字符串 | 文本输入、下拉选择 |
| `number` | 数字 | 数字输入、评分 |
| `boolean` | 布尔值 | 开关、复选框 |
| `object` | 对象 | 嵌套表单、地址信息 |
| `array` | 数组 | 动态列表、表格 |
| `void` | 虚拟节点 | 布局组件（Tab、Collapse） |

#### 2.2.2 void 类型的特殊性

`void` 类型不存储数据，仅用于布局和 UI 组织：

```typescript
// FormTab 是 void 类型，不产生数据
{
  type: 'void',
  'x-component': 'FormTab',
  properties: {
    tab1: {
      type: 'void',
      'x-component': 'FormTab.TabPane',
      'x-component-props': { tab: '基本信息' },
      properties: {
        // 实际的数据字段
        username: {
          type: 'string',
          'x-component': 'Input'
        }
      }
    }
  }
}
```

**数据结构**：
```json
{
  "username": "张三"  // FormTab 和 TabPane 不会出现在数据中
}
```

---

## 3. createSchemaField 实现原理

### 3.1 API 设计

```typescript
const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    FormItem,
    FormTab,
    // ... 其他组件
  },
  scope: {
    // 表达式作用域中的变量
    customFunction: () => {},
    constantValue: 100
  }
})

// 使用
<SchemaField schema={mySchema} />
```

### 3.2 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                     createSchemaField                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  注册组件映射表   │
                    │  components: {} │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  创建表达式作用域  │
                    │    scope: {}    │
                    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  返回 SchemaField │
                    │    React组件      │
                    └──────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐              ┌─────────────────┐
   │  递归遍历 Schema  │             │  解析表达式       │
   │  构建字段树       │             │  {{expression}}  │
   └─────────────────┘              └─────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  渲染组件树       │
                    │  Decorator +    │
                    │  Component      │
                    └─────────────────┘
```

### 3.3 核心实现逻辑

```typescript
// 简化的实现原理
function createSchemaField({ components, scope }) {
  // 1. 创建组件查找函数
  const getComponent = (name: string) => components[name]

  // 2. 创建表达式编译器
  const compileExpression = (expr: string) => {
    // 使用 new Function 编译表达式
    // {{$deps[0] + 10}} => function($deps) { return $deps[0] + 10 }
    return new Function('$scope', `with($scope) { return ${expr} }`)
  }

  // 3. 创建递归渲染器
  const RecursiveSchema = ({ schema, path = '' }) => {
    const { type, properties, 'x-component': component, 'x-decorator': decorator } = schema

    // 获取组件
    const Component = getComponent(component)
    const Decorator = getComponent(decorator)

    // 创建字段
    const field = useField()

    // 处理 x-reactions
    useEffect(() => {
      if (schema['x-reactions']) {
        // 注册 reactions
        const reactions = compileReactions(schema['x-reactions'])
        field.addReactions(reactions)
      }
    }, [])

    // 渲染子节点
    const children = type === 'object' || type === 'void'
      ? Object.keys(properties || {}).map(key => (
          <RecursiveSchema
            key={key}
            schema={properties[key]}
            path={`${path}.${key}`}
          />
        ))
      : null

    // 组合 Decorator + Component
    return (
      <Decorator {...schema['x-decorator-props']}>
        <Component {...schema['x-component-props']}>
          {children}
        </Component>
      </Decorator>
    )
  }

  // 4. 返回 SchemaField 组件
  return ({ schema }) => <RecursiveSchema schema={schema} />
}
```

---

## 4. x-decorator 和 x-component 设计

### 4.1 装饰器模式

```
┌──────────────────────────────────────┐
│         x-decorator (FormItem)       │  ← 提供标题、错误提示、布局
│  ┌────────────────────────────────┐  │
│  │    x-component (Input)         │  │  ← 实际的输入组件
│  │                                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### 4.2 示例：表单项装饰器

```typescript
// Schema 定义
{
  type: 'string',
  title: '用户名',
  'x-decorator': 'FormItem',           // 外层装饰器
  'x-decorator-props': {
    labelCol: 6,
    wrapperCol: 18,
    tooltip: '请输入真实姓名'
  },
  'x-component': 'Input',              // 内层组件
  'x-component-props': {
    placeholder: '请输入用户名',
    maxLength: 20
  }
}
```

**渲染结果**：
```tsx
<FormItem
  label="用户名"
  labelCol={6}
  wrapperCol={18}
  tooltip="请输入真实姓名"
>
  <Input
    placeholder="请输入用户名"
    maxLength={20}
  />
</FormItem>
```

### 4.3 组件注册

```typescript
const SchemaField = createSchemaField({
  components: {
    // 装饰器组件
    FormItem,
    FormLayout,

    // 输入组件
    Input,
    'Input.TextArea': Input.TextArea,  // 支持嵌套引用
    Select,
    DatePicker,

    // 布局组件
    FormTab,
    'FormTab.TabPane': FormTab.TabPane,
    FormGrid,

    // 数组组件
    ArrayItems,
    'ArrayItems.Addition': ArrayItems.Addition,
    'ArrayItems.Remove': ArrayItems.Remove,
  }
})
```

**使用嵌套组件**：
```typescript
{
  'x-component': 'Input.TextArea',  // 引用 Input.TextArea
  'x-component-props': {
    rows: 4
  }
}
```

---

## 5. x-reactions 联动机制

### 5.1 设计理念

`x-reactions` 是 Formily 最强大的特性，用于实现字段间的联动逻辑。它提供了声明式的依赖追踪和自动更新机制。

### 5.2 数据结构

```typescript
interface SchemaReactions {
  dependencies?: string[]           // 依赖的字段路径
  when?: string                     // 条件表达式
  fulfill?: {
    state?: any                     // 更新字段状态
    schema?: any                    // 更新字段 Schema
    run?: string                    // 执行自定义逻辑
  }
  effects?: Array<string>          // 生命周期钩子
}
```

### 5.3 核心概念

#### 5.3.1 dependencies：依赖追踪

```typescript
{
  name: 'city',
  'x-reactions': {
    dependencies: ['.province'],  // 依赖同级的 province 字段
    fulfill: {
      // 当 province 变化时触发
    }
  }
}
```

**路径语法**：
- `.fieldName`：同级字段
- `..fieldName`：父级字段
- `fieldName`：绝对路径
- `.*.quantity`：数组中每一项的 quantity 字段

#### 5.3.2 fulfill：执行动作

##### 更新状态（state）

```typescript
{
  'x-reactions': {
    dependencies: ['.userType'],
    fulfill: {
      state: {
        visible: "{{$deps[0] === 'personal'}}",    // 可见性
        required: "{{$deps[0] === 'personal'}}",   // 必填
        disabled: "{{$deps[0] === 'enterprise'}}",  // 禁用
        value: "{{$deps[0] === 'personal' ? '' : undefined}}"  // 清空值
      }
    }
  }
}
```

##### 更新 Schema（schema）

```typescript
{
  'x-reactions': {
    dependencies: ['.province'],
    fulfill: {
      schema: {
        // 动态更新组件属性
        'x-component-props': {
          options: "{{$deps[0] === 'beijing' ? beijingCities : shanghaiCities}}"
        }
      }
    }
  }
}
```

##### 执行代码（run）

```typescript
{
  'x-reactions': {
    dependencies: ['.quantity', '.unitPrice'],
    fulfill: {
      run: `{{
        const quantity = $deps[0] || 0;
        const unitPrice = $deps[1] || 0;
        $self.value = quantity * unitPrice;
      }}`
    }
  }
}
```

### 5.4 表达式变量

在 `x-reactions` 表达式中可以使用的变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `$self` | 当前字段对象 | `$self.value`、`$self.visible` |
| `$deps` | 依赖字段的值数组 | `$deps[0]`、`$deps[1]` |
| `$form` | 表单实例 | `$form.values`、`$form.setValues()` |
| `$values` | 表单所有值 | `$values.username` |
| `$scope` | 作用域变量 | 自定义的全局变量 |

### 5.5 实战案例：商品小计计算

**场景**：电商订单中，当选择商品和修改数量时，自动计算小计。

```typescript
const schema: ISchema = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            title: '商品',
            'x-component': 'Select',
            'x-component-props': {
              options: mockProducts.map(p => ({
                label: `${p.name} - ¥${p.price}`,
                value: p.id
              }))
            },
            // 当选择商品时，计算小计
            'x-reactions': [{
              dependencies: ['.quantity'],  // 依赖同级的 quantity
              fulfill: {
                run: `{{
                  const productId = $self.value;
                  const quantity = $deps[0] || 0;
                  const products = ${JSON.stringify(mockProducts)};

                  if (productId) {
                    const product = products.find(p => p.id === productId);
                    if (product) {
                      // 设置库存提示
                      $form.setFieldState($self.query('.quantity').take(), state => {
                        state.componentProps = {
                          ...state.componentProps,
                          max: product.stock,
                          placeholder: \`库存: \${product.stock}\`
                        };
                      });

                      // 计算小计
                      const subtotal = product.price * quantity;
                      $form.setFieldState($self.query('.subtotal').take(), state => {
                        state.value = subtotal;
                      });
                    }
                  }
                }}`
              }
            }]
          },
          quantity: {
            type: 'number',
            title: '数量',
            'x-component': 'NumberPicker',
            // 当修改数量时，重新计算小计
            'x-reactions': {
              dependencies: ['.productId'],
              fulfill: {
                run: `{{
                  const quantity = $self.value || 0;
                  const productId = $deps[0];
                  const products = ${JSON.stringify(mockProducts)};

                  if (productId) {
                    const product = products.find(p => p.id === productId);
                    if (product) {
                      const subtotal = product.price * quantity;
                      $form.setFieldState($self.query('.subtotal').take(), state => {
                        state.value = subtotal;
                      });
                    }
                  }
                }}`
              }
            }
          },
          subtotal: {
            type: 'number',
            title: '小计',
            'x-component': 'NumberPicker',
            'x-component-props': {
              disabled: true  // 只读，由计算得出
            }
          }
        }
      }
    }
  }
}
```

**工作流程**：
```
用户选择商品 (productId)
    │
    ├─→ 触发 productId 的 x-reactions
    │       ├─→ 读取 quantity 的值
    │       ├─→ 查找商品信息（价格、库存）
    │       ├─→ 更新 quantity 的 max 和 placeholder
    │       └─→ 计算 subtotal = price × quantity
    │
用户修改数量 (quantity)
    │
    └─→ 触发 quantity 的 x-reactions
            ├─→ 读取 productId 的值
            ├─→ 查找商品信息
            └─→ 重新计算 subtotal
```

---

## 6. x-validator 校验设计

### 6.1 基础用法

```typescript
{
  type: 'string',
  title: '手机号',
  'x-component': 'Input',
  'x-validator': [
    {
      required: true,
      message: '请输入手机号'
    },
    {
      pattern: '^1[3-9]\\d{9}$',
      message: '请输入有效的手机号'
    },
    {
      len: 11,
      message: '手机号必须是11位'
    }
  ]
}
```

### 6.2 内置校验规则

| 规则 | 说明 | 示例 |
|------|------|------|
| `required` | 必填 | `{ required: true }` |
| `pattern` | 正则匹配 | `{ pattern: '^\\d+$' }` |
| `max` | 最大值/长度 | `{ max: 100 }` |
| `min` | 最小值/长度 | `{ min: 0 }` |
| `len` | 精确长度 | `{ len: 11 }` |
| `enum` | 枚举值 | `{ enum: ['A', 'B'] }` |
| `validator` | 自定义函数 | `{ validator: (value) => {} }` |

### 6.3 自定义校验

```typescript
{
  'x-validator': [
    {
      validator: (value, rule) => {
        if (value && value.length < 6) {
          return '密码长度不能少于6位'
        }
        return ''
      }
    },
    {
      // 异步校验
      validator: async (value) => {
        const exists = await checkUsernameExists(value)
        if (exists) {
          return '用户名已存在'
        }
      }
    }
  ]
}
```

---

## 7. Schema 表达式系统

### 7.1 表达式语法

Formily 使用 `{{}}` 包裹的字符串作为表达式：

```typescript
{
  'x-component-props': {
    disabled: "{{$form.values.readonly === true}}"  // 表达式
  }
}
```

### 7.2 表达式编译

```typescript
// 表达式字符串
const expr = "{{$deps[0] + 10}}"

// 编译为函数
const compiled = new Function('$scope', 'with($scope) { return $scope[0] + 10 }')

// 执行
const result = compiled([5])  // 返回 15
```

### 7.3 作用域变量

#### 7.3.1 全局作用域

```typescript
const SchemaField = createSchemaField({
  components: { ... },
  scope: {
    // 自定义变量
    API_BASE_URL: 'https://api.example.com',
    formatDate: (date) => moment(date).format('YYYY-MM-DD'),

    // 常量数据
    COUNTRIES: ['中国', '美国', '日本'],

    // 工具函数
    calculateDiscount: (price, rate) => price * rate
  }
})
```

#### 7.3.2 在 Schema 中使用

```typescript
{
  'x-component-props': {
    options: "{{COUNTRIES.map(c => ({ label: c, value: c }))}}"
  },
  'x-reactions': {
    fulfill: {
      run: `{{
        const formatted = formatDate($self.value);
        console.log(formatted);
      }}`
    }
  }
}
```

### 7.4 表达式最佳实践

#### ✅ 推荐

```typescript
// 1. 简单的布尔判断
visible: "{{$deps[0] === 'show'}}"

// 2. 使用作用域函数
value: "{{formatPrice($deps[0])}}"

// 3. 三元表达式
disabled: "{{$form.values.status === 'readonly' ? true : false}}"
```

#### ❌ 不推荐

```typescript
// 1. 过于复杂的逻辑（应该抽取到 scope 中）
run: `{{
  const data = $deps[0];
  const result = data.map(item => {
    if (item.type === 'A') {
      return item.value * 1.1;
    } else if (item.type === 'B') {
      return item.value * 1.2;
    }
    // ... 100行代码
  });
  $self.value = result;
}}`

// 2. 在表达式中定义大量数据（应该放在 scope 中）
options: "{{[{label:'选项1',value:1},{label:'选项2',value:2},...]}}"
```

---

## 8. 数组字段的 Schema 设计

### 8.1 ArrayItems 组件

```typescript
{
  type: 'array',
  'x-component': 'ArrayItems',
  'x-decorator': 'FormItem',
  items: {
    type: 'object',
    properties: {
      // 数组项的字段定义
      name: {
        type: 'string',
        'x-component': 'Input'
      }
    }
  },
  properties: {
    // 控制按钮
    addition: {
      type: 'void',
      'x-component': 'ArrayItems.Addition',
      title: '添加项'
    }
  }
}
```

### 8.2 ArrayTable 组件

```typescript
{
  type: 'array',
  'x-component': 'ArrayTable',
  items: {
    type: 'object',
    properties: {
      // 列定义
      column1: {
        type: 'void',
        'x-component': 'ArrayTable.Column',
        'x-component-props': {
          title: '姓名',
          width: 200
        },
        properties: {
          name: {
            type: 'string',
            'x-component': 'Input'
          }
        }
      },
      column2: {
        type: 'void',
        'x-component': 'ArrayTable.Column',
        'x-component-props': {
          title: '年龄',
          width: 100
        },
        properties: {
          age: {
            type: 'number',
            'x-component': 'NumberPicker'
          }
        }
      },
      operations: {
        type: 'void',
        'x-component': 'ArrayTable.Column',
        'x-component-props': {
          title: '操作',
          width: 150,
          fixed: 'right'
        },
        properties: {
          remove: {
            type: 'void',
            'x-component': 'ArrayTable.Remove'
          },
          moveUp: {
            type: 'void',
            'x-component': 'ArrayTable.MoveUp'
          },
          moveDown: {
            type: 'void',
            'x-component': 'ArrayTable.MoveDown'
          }
        }
      }
    }
  },
  properties: {
    addition: {
      type: 'void',
      'x-component': 'ArrayTable.Addition',
      title: '添加行'
    }
  }
}
```

### 8.3 ArrayCollapse 组件

```typescript
{
  type: 'array',
  'x-component': 'ArrayCollapse',
  items: {
    type: 'object',
    'x-component': 'ArrayCollapse.CollapsePanel',
    'x-component-props': {
      // 标题支持表达式
      header: "{{`地址 ${$index + 1}`}}"
    },
    properties: {
      province: {
        type: 'string',
        title: '省份',
        'x-component': 'Select'
      },
      city: {
        type: 'string',
        title: '城市',
        'x-component': 'Select'
      }
    }
  }
}
```

### 8.4 数组字段的联动

```typescript
{
  type: 'array',
  'x-component': 'ArrayItems',
  // 监听整个数组变化
  'x-reactions': [{
    when: '{{true}}',
    fulfill: {
      run: `{{
        const items = $self.value || [];
        // 计算总数
        const total = items.reduce((sum, item) => sum + (item?.amount || 0), 0);
        $form.setFieldState('totalAmount', state => {
          state.value = total;
        });
      }}`
    }
  }],
  items: {
    type: 'object',
    properties: {
      // 数组项内部的联动
      quantity: {
        type: 'number',
        'x-reactions': {
          dependencies: ['.price'],
          fulfill: {
            run: `{{
              const quantity = $self.value || 0;
              const price = $deps[0] || 0;
              $form.setFieldState($self.query('.amount').take(), state => {
                state.value = quantity * price;
              });
            }}`
          }
        }
      }
    }
  }
}
```

---

## 9. 对象字段的 Schema 设计

### 9.1 基本用法

```typescript
{
  type: 'object',
  title: '收货地址',
  'x-decorator': 'FormItem',
  properties: {
    province: {
      type: 'string',
      title: '省份',
      'x-decorator': 'FormItem',
      'x-component': 'Select'
    },
    city: {
      type: 'string',
      title: '城市',
      'x-decorator': 'FormItem',
      'x-component': 'Select'
    },
    detail: {
      type: 'string',
      title: '详细地址',
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea'
    }
  }
}
```

**数据结构**：
```json
{
  "province": "北京市",
  "city": "朝阳区",
  "detail": "xxx街道xxx号"
}
```

### 9.2 嵌套对象

```typescript
{
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            avatar: { type: 'string' },
            bio: { type: 'string' }
          }
        }
      }
    }
  }
}
```

**数据结构**：
```json
{
  "user": {
    "profile": {
      "avatar": "https://...",
      "bio": "..."
    }
  }
}
```

### 9.3 对象字段的联动

```typescript
{
  shippingAddress: {
    type: 'object',
    // 整个对象的可见性控制
    'x-reactions': {
      dependencies: ['.orderType'],
      fulfill: {
        state: {
          visible: "{{$deps[0] === 'delivery'}}"
        }
      }
    },
    properties: {
      province: {
        type: 'string',
        'x-component': 'Select'
      },
      city: {
        type: 'string',
        'x-component': 'Select',
        // 城市选项依赖省份
        'x-reactions': {
          dependencies: ['.province'],  // 同级字段
          fulfill: {
            schema: {
              'x-component-props': {
                options: "{{getCitiesByProvince($deps[0])}}"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 10. void 字段的设计

### 10.1 为什么需要 void？

`void` 类型字段不存储数据，专门用于：
1. **布局组件**：Tab、Collapse、Card 等
2. **容器组件**：Space、Grid 等
3. **纯展示组件**：Divider、Text 等

### 10.2 FormTab 示例

```typescript
{
  type: 'object',
  properties: {
    tabs: {
      type: 'void',                      // void 类型
      'x-component': 'FormTab',
      properties: {
        tab1: {
          type: 'void',                  // TabPane 也是 void
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '基本信息',
            key: '1'
          },
          properties: {
            // 实际的数据字段
            username: {
              type: 'string',
              title: '用户名',
              'x-decorator': 'FormItem',
              'x-component': 'Input'
            }
          }
        },
        tab2: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '详细信息',
            key: '2'
          },
          properties: {
            email: {
              type: 'string',
              title: '邮箱',
              'x-decorator': 'FormItem',
              'x-component': 'Input'
            }
          }
        }
      }
    }
  }
}
```

**表单数据**（注意：tabs、tab1、tab2 不会出现）：
```json
{
  "username": "张三",
  "email": "zhangsan@example.com"
}
```

### 10.3 FormCollapse 示例

```typescript
{
  type: 'void',
  'x-component': 'FormCollapse',
  'x-component-props': {
    defaultActiveKey: ['panel1']
  },
  properties: {
    panel1: {
      type: 'void',
      'x-component': 'FormCollapse.CollapsePanel',
      'x-component-props': {
        header: '个人信息',
        key: 'panel1'
      },
      properties: {
        name: {
          type: 'string',
          'x-component': 'Input'
        }
      }
    }
  }
}
```

### 10.4 FormGrid 示例

```typescript
{
  type: 'void',
  'x-component': 'FormGrid',
  'x-component-props': {
    maxColumns: 3,
    columnGap: 16,
    rowGap: 16
  },
  properties: {
    field1: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input'
    },
    field2: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input'
    },
    field3: {
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input'
    }
  }
}
```

---

## 11. 实战案例分析

### 11.1 案例一：条件显示和级联选择

**需求**：根据用户类型显示不同的字段，省市联动。

参考：[examples/formily-demo/src/examples/06-FormEffects.tsx](../../examples/formily-demo/src/examples/06-FormEffects.tsx)

```typescript
const conditionalSchema: ISchema = {
  type: 'object',
  properties: {
    // 用户类型选择
    userType: {
      type: 'string',
      title: '用户类型',
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      enum: [
        { label: '个人用户', value: 'personal' },
        { label: '企业用户', value: 'enterprise' }
      ],
      default: 'personal'
    },

    // 个人用户字段（条件显示）
    name: {
      type: 'string',
      title: '姓名',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'personal'}}",
            required: "{{$deps[0] === 'personal'}}"
          }
        }
      }
    },

    // 企业用户字段（条件显示）
    companyName: {
      type: 'string',
      title: '企业名称',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}"
          }
        }
      }
    },

    // 省市级联
    province: {
      type: 'string',
      title: '省份',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      enum: [
        { label: '北京市', value: 'beijing' },
        { label: '上海市', value: 'shanghai' }
      ]
    },

    city: {
      type: 'string',
      title: '城市',
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-reactions': [
        {
          // 清空城市值
          dependencies: ['.province'],
          fulfill: {
            state: {
              value: '{{undefined}}'
            }
          }
        },
        {
          // 更新城市选项
          dependencies: ['.province'],
          fulfill: {
            schema: {
              'x-component-props': {
                options: `{{
                  $deps[0] === 'beijing'
                    ? [{label:'朝阳区',value:'chaoyang'},{label:'海淀区',value:'haidian'}]
                    : [{label:'浦东新区',value:'pudong'},{label:'徐汇区',value:'xuhui'}]
                }}`
              }
            }
          }
        }
      ]
    }
  }
}
```

**关键点**：
1. 使用 `dependencies` 追踪依赖字段
2. 使用 `state.visible` 控制可见性
3. 使用 `state.value` 清空级联字段的值
4. 使用 `schema['x-component-props']` 动态更新选项

### 11.2 案例二：复杂计算和优惠券

**需求**：电商订单，商品小计计算、优惠券应用、最终金额计算。

参考：[examples/formily-demo/src/examples/10-ComplexForm.tsx](../../examples/formily-demo/src/examples/10-ComplexForm.tsx)

```typescript
const orderSchema: ISchema = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      'x-component': 'ArrayItems',
      // 监听所有商品变化，计算总金额
      'x-reactions': [{
        when: '{{true}}',
        fulfill: {
          run: `{{
            const products = $self.value || [];
            const subtotal = products.reduce((sum, item) => {
              return sum + (item?.subtotal || 0);
            }, 0);

            $form.setFieldState('subtotalAmount', state => {
              state.value = subtotal;
            });
          }}`
        }
      }],
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            title: '商品',
            'x-component': 'Select',
            // 选择商品时，计算小计和设置库存
            'x-reactions': [{
              dependencies: ['.quantity'],
              fulfill: {
                run: `{{
                  const productId = $self.value;
                  const quantity = $deps[0] || 0;
                  const products = ${JSON.stringify(mockProducts)};

                  if (productId) {
                    const product = products.find(p => p.id === productId);
                    if (product) {
                      // 设置库存提示
                      $form.setFieldState($self.query('.quantity').take(), state => {
                        state.componentProps = {
                          ...state.componentProps,
                          max: product.stock,
                          placeholder: \`库存: \${product.stock}\`
                        };
                      });

                      // 计算小计
                      const subtotal = product.price * quantity;
                      $form.setFieldState($self.query('.subtotal').take(), state => {
                        state.value = subtotal;
                      });
                    }
                  }
                }}`
              }
            }]
          },
          quantity: {
            type: 'number',
            title: '数量',
            'x-component': 'NumberPicker'
          },
          subtotal: {
            type: 'number',
            title: '小计',
            'x-component': 'NumberPicker',
            'x-component-props': {
              disabled: true
            }
          }
        }
      }
    },

    // 商品小计
    subtotalAmount: {
      type: 'number',
      title: '商品小计',
      'x-component': 'NumberPicker',
      'x-component-props': {
        disabled: true
      }
    },

    // 优惠券
    couponId: {
      type: 'string',
      title: '优惠券',
      'x-component': 'Select',
      'x-reactions': [{
        dependencies: ['.subtotalAmount'],
        fulfill: {
          run: `{{
            const couponId = $self.value;
            const subtotal = $deps[0] || 0;
            const coupons = ${JSON.stringify(mockCoupons)};

            let discountAmount = 0;
            let finalAmount = subtotal;

            if (couponId) {
              const coupon = coupons.find(c => c.id === couponId);
              if (coupon && subtotal >= coupon.minAmount) {
                if (coupon.type === 'fixed') {
                  discountAmount = coupon.discount;
                } else {
                  discountAmount = subtotal * (1 - coupon.discount);
                }
                finalAmount = subtotal - discountAmount;
              }
            }

            $form.setValues({
              discountAmount,
              finalAmount
            });
          }}`
        }
      }]
    },

    // 优惠金额
    discountAmount: {
      type: 'number',
      title: '优惠金额',
      'x-component': 'NumberPicker',
      'x-component-props': {
        disabled: true
      }
    },

    // 应付金额
    finalAmount: {
      type: 'number',
      title: '应付金额',
      'x-component': 'NumberPicker',
      'x-component-props': {
        disabled: true
      }
    }
  }
}
```

**计算流程**：
```
1. 用户选择商品 → 触发 productId 的 x-reactions
   ├─→ 读取数量
   ├─→ 查找商品价格
   ├─→ 计算小计
   └─→ 更新库存提示

2. 所有商品小计变化 → 触发 products 的 x-reactions
   ├─→ 遍历所有商品
   ├─→ 累加小计
   └─→ 更新 subtotalAmount

3. 选择优惠券或小计变化 → 触发 couponId 的 x-reactions
   ├─→ 读取商品小计
   ├─→ 判断是否满足优惠券条件
   ├─→ 计算折扣金额
   └─→ 计算最终应付金额
```

### 11.3 案例三：动态表单（表格编辑）

**需求**：动态联系人列表，支持添加、删除、排序。

参考：[examples/formily-demo/src/examples/02-ArrayField.tsx](../../examples/formily-demo/src/examples/02-ArrayField.tsx)

```typescript
const arrayTableSchema: ISchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      items: {
        type: 'object',
        properties: {
          // 序号列
          column1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '序号',
              width: 80,
              align: 'center'
            },
            properties: {
              index: {
                type: 'void',
                'x-component': 'ArrayTable.Index'
              }
            }
          },

          // 姓名列
          column2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '姓名',
              width: 200
            },
            properties: {
              name: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入姓名'
                },
                required: true
              }
            }
          },

          // 电话列
          column3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '电话',
              width: 200
            },
            properties: {
              phone: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入电话'
                },
                'x-validator': [
                  {
                    pattern: '^1[3-9]\\d{9}$',
                    message: '请输入有效的手机号'
                  }
                ]
              }
            }
          },

          // 操作列
          column4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '操作',
              width: 150,
              fixed: 'right'
            },
            properties: {
              operations: {
                type: 'void',
                'x-component': 'Space',
                properties: {
                  moveUp: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveUp'
                  },
                  moveDown: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveDown'
                  },
                  remove: {
                    type: 'void',
                    'x-component': 'ArrayTable.Remove'
                  }
                }
              }
            }
          }
        }
      },
      properties: {
        // 添加按钮
        addition: {
          type: 'void',
          title: '添加联系人',
          'x-component': 'ArrayTable.Addition'
        }
      }
    }
  }
}
```

**数据结构**：
```json
{
  "contacts": [
    { "name": "张三", "phone": "13800138000" },
    { "name": "李四", "phone": "13900139000" }
  ]
}
```

---

## 12. 架构设计总结

### 12.1 核心架构

```
┌─────────────────────────────────────────────────────────┐
│                  @formily/json-schema                   │
│                                                         │
│  ┌────────────────┐          ┌────────────────┐         │
│  │   ISchema      │          │ createSchema   │         │
│  │   类型定义      │  ←─────  │   Field        │         │
│  └────────────────┘          └────────────────┘         │
│         │                             │                 │
│         │                             │                 │
│         ▼                             ▼                 │
│  ┌────────────────┐          ┌────────────────┐         │
│  │  Schema Parser │          │  Expression    │         │
│  │  递归解析器      │          │  Compiler      │         │
│  └────────────────┘          └────────────────┘         │
│         │                             │                 │
│         └──────────┬──────────────────┘                 │
│                    ▼                                    │
│         ┌────────────────────┐                          │
│         │  Component Mapper  │                          │
│         │  组件映射渲染        │                          │
│         └────────────────────┘                          │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────┐
         │   @formily/react   │
         │   React 组件树      │
         └────────────────────┘
```

### 12.2 设计优势

1. **声明式配置**：表单结构可序列化、可存储、可传输
2. **类型安全**：完整的 TypeScript 类型定义
3. **强大的联动**：x-reactions 提供声明式的字段联动
4. **表达式系统**：支持动态计算和条件渲染
5. **组件解耦**：Schema 与组件实现分离
6. **递归结构**：支持任意深度的嵌套
7. **跨平台**：Schema 定义与框架无关

### 12.3 使用场景

| 场景 | JSX 模式 | JSON Schema 模式 |
|------|----------|------------------|
| 静态表单 | ✅ 推荐 | ✅ 可用 |
| 动态表单 | ❌ 不适合 | ✅ 推荐 |
| 低代码平台 | ❌ 不适合 | ✅ 推荐 |
| 表单设计器 | ❌ 不适合 | ✅ 推荐 |
| 复杂联动 | ⚠️ 代码多 | ✅ 推荐 |
| 性能优化 | ✅ 容易 | ⚠️ 需注意表达式 |

### 12.4 最佳实践

#### ✅ 推荐

1. **复杂数据放 scope**
```typescript
const SchemaField = createSchemaField({
  scope: {
    productOptions: mockProducts.map(p => ({ label: p.name, value: p.id }))
  }
})

// Schema 中使用
'x-component-props': {
  options: '{{productOptions}}'
}
```

2. **复杂逻辑抽取函数**
```typescript
scope: {
  calculateDiscount: (subtotal, couponId, coupons) => {
    // 复杂的折扣计算逻辑
    return discountAmount;
  }
}

// Schema 中使用
run: '{{$self.value = calculateDiscount($deps[0], $deps[1], coupons)}}'
```

3. **使用 when 条件**
```typescript
'x-reactions': {
  when: '{{$deps[0] > 0}}',  // 条件判断
  fulfill: {
    state: { visible: true }
  },
  otherwise: {
    state: { visible: false }
  }
}
```

#### ❌ 避免

1. **在表达式中写大量逻辑**
2. **过度使用 x-reactions（可能导致性能问题）**
3. **循环依赖（A 依赖 B，B 依赖 A）**
4. **在 run 中直接修改 DOM**

---

## 13. 参考资源

- [Formily 官方文档](https://formilyjs.org/)
- [JSON Schema 规范](https://json-schema.org/)
- [示例代码](../../examples/formily-demo/)
- [x-reactions 详解](./03-formily-x-reactions.md)
- [源码分析](../../source-code/formily-reactions-impl.ts)
