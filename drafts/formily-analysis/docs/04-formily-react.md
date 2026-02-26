# @formily/react 详解：React 集成与组件绑定

## 目录

1. [设计理念](#1-设计理念)
2. [核心架构](#2-核心架构)
3. [组件体系](#3-组件体系)
4. [connect 连接器](#4-connect-连接器)
5. [mapProps 映射器](#5-mapprops-映射器)
6. [组件库绑定机制](#6-组件库绑定机制)
7. [Hooks 体系](#7-hooks-体系)
8. [SchemaField 渲染器](#8-schemafield-渲染器)
9. [实战案例](#9-实战案例)
10. [最佳实践](#10-最佳实践)

---

## 1. 设计理念

### 1.1 核心思想

@formily/react 是 Formily 的 React 绑定层,其设计理念包括:

1. **分离关注点**
   - **@formily/core**: 领域模型层(Form/Field)
   - **@formily/reactive**: 响应式系统层
   - **@formily/react**: 视图绑定层
   - **@formily/antd**: 组件适配层

2. **响应式驱动视图**
   - 使用 `@formily/reactive` 的响应式能力
   - 组件自动订阅字段状态变化
   - 精准更新,无需手动管理

3. **组件无侵入**
   - 不修改第三方组件源码
   - 通过 `connect` 高阶组件包装
   - 通过 `mapProps` 适配属性

4. **声明式渲染**
   - JSX 模式:直接使用 React 组件
   - Schema 模式:通过 JSON 配置渲染

### 1.2 分层架构

```
┌─────────────────────────────────────┐
│          用户层(业务代码)             │
│   FormProvider + SchemaField/JSX    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│       @formily/react (视图层)        │
│  connect/mapProps/Hooks/Components  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    @formily/reactive (响应式层)      │
│      observer/observable/autorun    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      @formily/core (模型层)          │
│         Form/Field/Effects          │
└─────────────────────────────────────┘
```

---

## 2. 核心架构

### 2.1 Provider/Consumer 模式

#### FormProvider

提供 Form 实例给整个表单树:

```tsx
import { createForm } from '@formily/core'
import { FormProvider } from '@formily/react'

const form = createForm()

<FormProvider form={form}>
  {/* 所有子组件都可以访问 form 实例 */}
</FormProvider>
```

**实现原理**:

```tsx
// FormContext 定义
const FormContext = React.createContext<Form>(null)

// FormProvider 实现
export const FormProvider: React.FC<{ form: Form }> = ({ form, children }) => {
  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  )
}
```

#### FieldContext

提供当前 Field 实例给子组件:

```tsx
const FieldContext = React.createContext<Field>(null)

// Field 组件会提供 FieldContext
<Field name="username">
  {/* 子组件可以通过 useField() 获取当前字段 */}
</Field>
```

### 2.2 响应式更新机制

#### observer 高阶组件

将 React 组件变成响应式组件:

```tsx
import { observer } from '@formily/react'

// 组件内部访问的响应式数据发生变化时,组件会自动重新渲染
const MyComponent = observer(() => {
  const field = useField()

  // field.value 是响应式的,变化时组件会更新
  return <div>{field.value}</div>
})
```

**实现原理**:

```tsx
import { Tracker } from '@formily/reactive'

function observer<T>(component: React.FC<T>) {
  return React.memo((props: T) => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0)
    const trackerRef = React.useRef<Tracker>()

    if (!trackerRef.current) {
      trackerRef.current = new Tracker(() => {
        forceUpdate() // 当依赖变化时强制更新
      })
    }

    return trackerRef.current.track(() => {
      return component(props) // 追踪组件内的响应式访问
    })
  })
}
```

**核心机制**:
1. 使用 `Tracker` 追踪组件渲染时访问的响应式数据
2. 当这些数据变化时,触发 `forceUpdate` 重新渲染
3. 只有真正用到的数据变化才会触发更新(精准更新)

---

## 3. 组件体系

### 3.1 Field 组件

用于创建表单字段:

```tsx
import { Field } from '@formily/react'

<Field
  name="username"           // 字段路径
  title="用户名"            // 标题
  required                  // 必填
  initialValue="张三"       // 初始值
  decorator={[FormItem]}    // 装饰器组件
  component={[Input]}       // 渲染组件
  reactions={(field) => {   // 联动逻辑
    // 响应式逻辑
  }}
/>
```

**实现原理**:

```tsx
export const Field: React.FC<IFieldProps> = (props) => {
  const form = useForm()
  const parent = useField()
  const basePath = parent?.address || form.address

  // 创建或获取 Field 实例
  const field = React.useMemo(() => {
    return form.createField({
      name: props.name,
      basePath,
      ...props,
    })
  }, [])

  // 渲染装饰器和组件
  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field}>
        {props.children}
      </ReactiveField>
    </FieldContext.Provider>
  )
}
```

### 3.2 ObjectField 组件

用于创建对象类型字段:

```tsx
<ObjectField name="address">
  <Field name="province" component={[Input]} />
  <Field name="city" component={[Input]} />
</ObjectField>
```

**特点**:
- 不渲染实际 UI 组件
- 作为字段容器,组织字段路径
- 支持嵌套对象结构

### 3.3 ArrayField 组件

用于创建数组类型字段:

```tsx
<ArrayField name="contacts">
  {(field) => {
    return field.value?.map((item, index) => (
      <ObjectField name={index} key={index}>
        <Field name="name" component={[Input]} />
        <Field name="phone" component={[Input]} />
      </ObjectField>
    ))
  }}
</ArrayField>
```

**特点**:
- 管理数组字段
- 提供 `field.push()`、`field.remove()` 等方法
- 支持数组项的增删改查

### 3.4 VoidField 组件

纯 UI 容器字段,不存储数据:

```tsx
<VoidField name="layout" component={[Card]}>
  <Field name="username" component={[Input]} />
  <Field name="password" component={[Input]} />
</VoidField>
```

**用途**:
- 布局容器(Card、FormLayout 等)
- 不参与数据收集
- 可以有自己的状态(visible、disabled 等)

---

## 4. connect 连接器

### 4.1 connect 的作用

`connect` 是一个高阶组件工厂,用于将第三方组件连接到 Formily 响应式系统。

**核心功能**:
1. 自动订阅字段状态变化
2. 将字段状态映射为组件 props
3. 处理组件事件回调

### 4.2 基本用法

```tsx
import { connect } from '@formily/react'
import { Input as AntdInput } from 'antd'

// 将 Antd Input 连接到 Formily
const Input = connect(AntdInput)

// 使用
<Field name="username" component={[Input]} />
```

### 4.3 实现原理

```tsx
export function connect<T extends React.ComponentType>(
  component: T,
  ...args: any[]
): T {
  const Component = observer((props: any) => {
    const field = useField<Field>()

    // 合并字段状态和组件 props
    const mergedProps = {
      ...props,
      value: field.value,           // 字段值
      disabled: !field.editable,    // 编辑态
      readOnly: field.readOnly,     // 只读态
      onChange: (event) => {        // 变化回调
        field.onInput(event)
        props.onChange?.(event)
      },
    }

    return React.createElement(component, mergedProps)
  })

  return Component as T
}
```

**工作流程**:

```
1. connect(Input) 创建包装组件
       ↓
2. 包装组件通过 useField() 获取字段实例
       ↓
3. observer 订阅字段状态变化
       ↓
4. 将 field.value/disabled 等映射为组件 props
       ↓
5. 字段状态变化时自动更新组件
```

### 4.4 高级用法

#### 连接多个映射器

```tsx
const Input = connect(
  AntdInput,
  mapProps({
    value: 'fieldValue',      // 将 field.value 映射为 fieldValue prop
    readOnly: 'readMode',     // 将 field.readOnly 映射为 readMode prop
  }),
  mapReadPretty(PreviewText)  // 阅读态使用 PreviewText 组件
)
```

---

## 5. mapProps 映射器

### 5.1 mapProps 的作用

`mapProps` 用于将字段状态映射为组件所需的 props 格式。

**核心场景**:
1. 字段属性名与组件 prop 名不一致
2. 需要对字段值进行转换
3. 需要合并多个字段状态

### 5.2 基本用法

#### 简单映射

```tsx
import { mapProps } from '@formily/react'

const NumberPicker = connect(
  InputNumber,
  mapProps({
    value: 'numberValue',     // field.value → numberValue prop
    readOnly: 'readonly',     // field.readOnly → readonly prop
  })
)
```

#### 函数映射

```tsx
const Checkbox = connect(
  AntdCheckbox,
  mapProps((props, field) => {
    return {
      ...props,
      checked: field.value,  // value → checked
      onChange: (e) => {
        field.onInput(e.target.checked)
      },
    }
  })
)
```

### 5.3 内置映射器

#### mapReadPretty

将组件的阅读态映射为另一个组件:

```tsx
const Input = connect(
  AntdInput,
  mapReadPretty(PreviewText)  // 阅读态使用 PreviewText
)

// 使用
<Field
  name="username"
  component={[Input]}
  readPretty  // 字段阅读态时会渲染 PreviewText
/>
```

**实现原理**:

```tsx
export function mapReadPretty(component: React.ComponentType) {
  return (target: React.ComponentType) => {
    return observer((props: any) => {
      const field = useField()

      // 阅读态返回 PreviewText,编辑态返回原组件
      if (field.pattern === 'readPretty') {
        return React.createElement(component, props)
      }
      return React.createElement(target, props)
    })
  }
}
```

#### mapStatus

将字段状态映射为组件的状态 prop:

```tsx
const Input = connect(
  AntdInput,
  mapStatus()  // 将 field.validateStatus 映射为 status prop
)
```

**映射规则**:
- `field.validateStatus === 'error'` → `status="error"`
- `field.validateStatus === 'warning'` → `status="warning"`
- `field.loading` → `status="validating"`

---

## 6. 组件库绑定机制

### 6.1 Ant Design 绑定案例

#### Step 1: 创建基础连接器

```tsx
// Input 组件
import { Input as AntdInput } from 'antd'
import { connect, mapProps, mapReadPretty } from '@formily/react'

export const Input = connect(
  AntdInput,
  mapProps((props, field) => {
    return {
      ...props,
      suffix: (
        <span>
          {field.loading && <LoadingOutlined />}
          {props.suffix}
        </span>
      ),
    }
  }),
  mapReadPretty(PreviewText.Input)
)
```

#### Step 2: 创建 FormItem 装饰器

FormItem 用于包装字段组件,提供标签、校验信息等:

```tsx
import { FormItem as AntdFormItem } from 'antd'
import { connect } from '@formily/react'

export const FormItem = connect(
  AntdFormItem,
  mapProps(
    {
      // 字段标题映射
      title: 'label',
      // 字段描述映射
      description: 'extra',
      // 必填标记
      required: true,
      // 校验状态
      validateStatus: true,
    },
    (props, field) => {
      // 自定义映射逻辑
      return {
        ...props,
        // 校验反馈信息
        help: field.selfErrors.length ? field.selfErrors : undefined,
        // 校验状态
        validateStatus: field.validateStatus,
        // 必填星号
        required: field.required,
      }
    }
  )
)
```

#### Step 3: 创建复杂组件

```tsx
// Select 组件
export const Select = connect(
  AntdSelect,
  mapProps({
    dataSource: 'options',  // 将 dataSource 映射为 options
    loading: true,
  }),
  mapReadPretty(PreviewText.Select)
)

// DatePicker 组件
export const DatePicker = connect(
  AntdDatePicker,
  mapProps((props, field) => {
    return {
      ...props,
      value: field.value ? moment(field.value) : undefined,
      onChange: (date) => {
        field.onInput(date?.valueOf())
      },
    }
  }),
  mapReadPretty(PreviewText.DatePicker)
)
```

### 6.2 自定义组件库绑定

假设要绑定一个自定义的 ColorPicker 组件:

```tsx
// 原始组件
interface ColorPickerProps {
  color: string           // 注意:使用 color 而不是 value
  onColorChange: (color: string) => void  // 注意:不是 onChange
  disabled?: boolean
}

const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  // ...
}
```

#### 绑定步骤

```tsx
import { connect, mapProps } from '@formily/react'

// 1. 创建连接器
export const FormilyColorPicker = connect(
  ColorPicker,
  // 2. 映射 props
  mapProps((props, field) => {
    return {
      color: field.value,              // value → color
      onColorChange: field.onInput,    // onChange → onColorChange
      disabled: !field.editable,       // editable → disabled
    }
  })
)

// 3. 使用
<Field
  name="themeColor"
  title="主题颜色"
  component={[FormilyColorPicker]}
  decorator={[FormItem]}
/>
```

### 6.3 绑定容器组件

某些组件是容器型组件(如 Card、Tabs),需要使用 VoidField:

```tsx
import { Card } from 'antd'
import { connect, mapProps } from '@formily/react'

// 绑定 Card
export const FormCard = connect(
  Card,
  mapProps((props, field) => {
    return {
      ...props,
      title: field.title,
      // 控制卡片显示隐藏
      style: {
        ...props.style,
        display: field.visible ? 'block' : 'none',
      },
    }
  })
)

// 使用
<VoidField name="basicInfo" title="基本信息" component={[FormCard]}>
  <Field name="name" component={[Input]} />
  <Field name="age" component={[NumberPicker]} />
</VoidField>
```

---

## 7. Hooks 体系

### 7.1 useForm

获取当前 Form 实例:

```tsx
import { useForm } from '@formily/react'

const MyComponent = () => {
  const form = useForm()

  const handleSubmit = () => {
    form.submit((values) => {
      console.log(values)
    })
  }

  return <button onClick={handleSubmit}>提交</button>
}
```

### 7.2 useField

获取当前 Field 实例:

```tsx
import { useField } from '@formily/react'

const MyComponent = () => {
  const field = useField()

  return (
    <div>
      <span>当前值: {field.value}</span>
      <span>校验状态: {field.validateStatus}</span>
    </div>
  )
}
```

### 7.3 useFieldSchema

获取当前字段的 Schema:

```tsx
import { useFieldSchema } from '@formily/react'

const MyComponent = () => {
  const schema = useFieldSchema()

  return <div>Schema type: {schema.type}</div>
}
```

### 7.4 useParentForm

获取父表单实例(用于嵌套表单):

```tsx
import { useParentForm } from '@formily/react'

const ChildForm = () => {
  const parentForm = useParentForm()

  // 可以访问父表单的状态和方法
  return <div>Parent form values: {JSON.stringify(parentForm.values)}</div>
}
```

### 7.5 useFormEffects

在组件内部注册 Effects:

```tsx
import { useFormEffects } from '@formily/react'
import { onFieldValueChange } from '@formily/core'

const MyComponent = () => {
  useFormEffects(() => {
    onFieldValueChange('username', (field) => {
      console.log('Username changed:', field.value)
    })
  })

  return <div>...</div>
}
```

### 7.6 自定义 Hook 实现

实际上这些 Hooks 都非常简单:

```tsx
// useForm 实现
export const useForm = <T extends Form>(): T => {
  return useContext(FormContext) as T
}

// useField 实现
export const useField = <T extends GeneralField>(): T => {
  return useContext(FieldContext) as T
}

// useFieldSchema 实现
export const useFieldSchema = (): Schema => {
  return useContext(SchemaContext)
}
```

---

## 8. SchemaField 渲染器

### 8.1 createSchemaField

`createSchemaField` 用于创建 Schema 渲染器:

```tsx
import { createSchemaField } from '@formily/react'
import { FormItem, Input, Select } from './components'

const SchemaField = createSchemaField({
  components: {
    FormItem,   // 装饰器组件
    Input,      // 表单组件
    Select,
  },
})
```

### 8.2 工作原理

#### 组件注册表

```tsx
export function createSchemaField(options: {
  components?: Record<string, React.ComponentType>
  scope?: Record<string, any>
}) {
  const { components = {}, scope = {} } = options

  // 创建 Schema 字段组件
  const SchemaField: React.FC<ISchemaFieldProps> = (props) => {
    return (
      <SchemaComponentsContext.Provider value={components}>
        <SchemaScopeContext.Provider value={scope}>
          <RecursionField {...props} />
        </SchemaScopeContext.Provider>
      </SchemaComponentsContext.Provider>
    )
  }

  return SchemaField
}
```

#### RecursionField 递归渲染

`RecursionField` 是核心渲染器,递归渲染 Schema 树:

```tsx
export const RecursionField: React.FC<IRecursionFieldProps> = (props) => {
  const { schema, name, basePath } = props
  const components = useContext(SchemaComponentsContext)

  // 从 Schema 提取渲染信息
  const fieldProps = schema.toFieldProps()
  const decorator = schema['x-decorator']
  const component = schema['x-component']

  // 渲染逻辑
  const renderField = () => {
    if (schema.type === 'object') {
      return <ObjectField {...fieldProps} name={name} basePath={basePath} />
    } else if (schema.type === 'array') {
      return <ArrayField {...fieldProps} name={name} basePath={basePath} />
    } else if (schema.type === 'void') {
      return <VoidField {...fieldProps} name={name} basePath={basePath} />
    } else {
      return <Field {...fieldProps} name={name} basePath={basePath} />
    }
  }

  // 渲染装饰器
  const renderDecorator = (children) => {
    if (!decorator) return children

    const DecoratorComponent = components[decorator]
    const decoratorProps = schema['x-decorator-props'] || {}

    return <DecoratorComponent {...decoratorProps}>{children}</DecoratorComponent>
  }

  // 渲染组件
  const renderComponent = () => {
    if (!component) return null

    const Component = components[component]
    const componentProps = schema['x-component-props'] || {}

    return <Component {...componentProps} />
  }

  // 递归渲染子字段
  const renderProperties = () => {
    const properties = schema.properties || {}
    return Object.keys(properties).map(key => (
      <RecursionField
        key={key}
        schema={properties[key]}
        name={key}
        basePath={/* ... */}
      />
    ))
  }

  return renderDecorator(
    renderField(
      renderComponent(),
      renderProperties()
    )
  )
}
```

**渲染流程**:

```
Schema 树
  ↓
RecursionField 解析
  ↓
创建 Field 实例 (Field/ObjectField/ArrayField/VoidField)
  ↓
渲染装饰器组件 (x-decorator)
  ↓
渲染表单组件 (x-component)
  ↓
递归渲染子字段 (properties)
```

### 8.3 组件查找机制

```tsx
// Schema
const schema = {
  type: 'string',
  'x-decorator': 'FormItem',      // 装饰器名称
  'x-component': 'Input',         // 组件名称
  'x-component-props': {          // 组件 props
    placeholder: '请输入',
  },
}

// 组件查找
const SchemaField = createSchemaField({
  components: {
    FormItem,  // 通过字符串 'FormItem' 查找到这个组件
    Input,     // 通过字符串 'Input' 查找到这个组件
  },
})
```

**优势**:
1. Schema 使用字符串引用组件,可以序列化
2. 支持动态注册组件
3. 避免循环依赖

---

## 9. 实战案例

### 9.1 绑定第三方日期选择器

假设要绑定 `react-datepicker`:

```tsx
import ReactDatePicker from 'react-datepicker'
import { connect, mapProps, mapReadPretty } from '@formily/react'

// 1. 创建阅读态组件
const DatePreview: React.FC<{ value: Date }> = ({ value }) => {
  return <span>{value ? value.toLocaleDateString() : '-'}</span>
}

// 2. 绑定组件
export const DatePicker = connect(
  ReactDatePicker,
  mapProps((props, field) => {
    return {
      selected: field.value,        // value → selected
      onChange: (date) => {         // onChange 直接传递 Date
        field.onInput(date)
      },
      disabled: !field.editable,
    }
  }),
  mapReadPretty(DatePreview)
)

// 3. 使用
<Field
  name="birthday"
  title="生日"
  component={[DatePicker]}
  decorator={[FormItem]}
/>
```

### 9.2 绑定富文本编辑器

绑定 `react-quill`:

```tsx
import ReactQuill from 'react-quill'
import { connect, mapProps } from '@formily/react'

export const RichText = connect(
  ReactQuill,
  mapProps((props, field) => {
    return {
      value: field.value || '',
      onChange: (content) => {
        // Quill 返回 HTML 字符串
        field.onInput(content)
      },
      readOnly: !field.editable,
    }
  })
)

// 使用
<Field
  name="content"
  title="文章内容"
  component={[RichText, { theme: 'snow' }]}  // 传递额外 props
  decorator={[FormItem]}
/>
```

### 9.3 创建自定义评分组件

```tsx
import { Rate } from 'antd'
import { connect, mapProps } from '@formily/react'

// 阅读态组件
const RatePreview: React.FC<{ value: number }> = ({ value }) => {
  return <Rate disabled value={value} />
}

// 绑定组件
export const Rating = connect(
  Rate,
  mapProps({
    value: true,
    onChange: true,
    disabled: 'readOnly',  // disabled 从 field.readOnly 映射
  }),
  mapReadPretty(RatePreview)
)

// 使用
<Field
  name="satisfaction"
  title="满意度"
  component={[Rating]}
  decorator={[FormItem]}
  reactions={(field) => {
    // 评分大于 3 显示感谢信息
    if (field.value > 3) {
      field.form.setFieldState('thanks', state => {
        state.visible = true
      })
    }
  }}
/>
```

### 9.4 绑定上传组件

```tsx
import { Upload } from 'antd'
import { connect, mapProps } from '@formily/react'

export const Uploader = connect(
  Upload,
  mapProps((props, field) => {
    return {
      ...props,
      fileList: field.value || [],
      onChange: ({ fileList }) => {
        field.onInput(fileList)
      },
      disabled: !field.editable,
    }
  })
)

// 使用
<Field
  name="attachments"
  title="附件"
  component={[Uploader, {
    action: '/api/upload',
    listType: 'picture-card',
  }]}
  decorator={[FormItem]}
/>
```

---

## 10. 最佳实践

### 10.1 组件库绑定建议

#### 统一管理绑定组件

```tsx
// components/index.ts
import { connect, mapProps, mapReadPretty } from '@formily/react'
import { Input, Select, DatePicker } from 'antd'
import { PreviewText } from './PreviewText'

// 统一导出绑定后的组件
export const FormilyInput = connect(
  Input,
  mapReadPretty(PreviewText.Input)
)

export const FormilySelect = connect(
  Select,
  mapProps({ dataSource: 'options' }),
  mapReadPretty(PreviewText.Select)
)

export const FormilyDatePicker = connect(
  DatePicker,
  mapProps((props, field) => ({
    ...props,
    value: field.value ? moment(field.value) : undefined,
    onChange: (date) => field.onInput(date?.valueOf()),
  })),
  mapReadPretty(PreviewText.DatePicker)
)
```

#### 创建统一的 SchemaField

```tsx
// schema-field.ts
import { createSchemaField } from '@formily/react'
import * as Components from './components'

export const SchemaField = createSchemaField({
  components: {
    ...Components,
  },
  scope: {
    // 可以注入全局变量
    $moment: moment,
  },
})
```

### 10.2 性能优化

#### 使用 observer 精准订阅

```tsx
// ❌ 不好的做法 - 整个组件都会重新渲染
const BadComponent = () => {
  const form = useForm()
  return (
    <div>
      <div>Username: {form.values.username}</div>
      <div>Email: {form.values.email}</div>
    </div>
  )
}

// ✅ 好的做法 - 只订阅需要的字段
const GoodComponent = observer(() => {
  const form = useForm()
  return (
    <div>
      <div>Username: {form.values.username}</div>
      <div>Email: {form.values.email}</div>
    </div>
  )
})
```

#### 使用字段查询而非表单值

```tsx
// ❌ 不好 - 访问 form.values 会订阅整个表单
const field = useField()
const username = field.form.values.username

// ✅ 好 - 只订阅特定字段
const field = useField()
const username = field.query('.username').value()
```

### 10.3 类型安全

#### 使用 TypeScript 约束组件 props

```tsx
interface MyComponentProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

const MyComponent: React.FC<MyComponentProps> = (props) => {
  // ...
}

// 绑定时保持类型
export const FormilyMyComponent = connect(
  MyComponent,
  mapProps<MyComponentProps>((props, field) => ({
    value: field.value,
    onChange: field.onInput,
    placeholder: props.placeholder,
  }))
)
```

#### 使用泛型约束字段类型

```tsx
interface FormValues {
  username: string
  age: number
  hobbies: string[]
}

const form = createForm<FormValues>()

// TypeScript 会提示可用的字段路径
form.setFieldState('username', state => {
  state.value = 'hello'  // ✅ 类型正确
})

form.setFieldState('username', state => {
  state.value = 123  // ❌ 类型错误
})
```

### 10.4 测试建议

#### 测试绑定组件

```tsx
import { render } from '@testing-library/react'
import { createForm } from '@formily/core'
import { FormProvider, Field } from '@formily/react'
import { FormilyInput } from './components'

test('Input 绑定正确', () => {
  const form = createForm()

  const { getByPlaceholderText } = render(
    <FormProvider form={form}>
      <Field
        name="username"
        component={[FormilyInput, { placeholder: '请输入' }]}
      />
    </FormProvider>
  )

  const input = getByPlaceholderText('请输入') as HTMLInputElement

  // 测试双向绑定
  fireEvent.change(input, { target: { value: 'test' } })
  expect(form.values.username).toBe('test')

  // 测试状态同步
  form.setFieldState('username', state => {
    state.value = 'new value'
  })
  expect(input.value).toBe('new value')
})
```

---

## 总结

### @formily/react 的核心优势

1. **响应式驱动**
   - 基于 `@formily/reactive` 的精准更新
   - 组件自动订阅字段状态
   - 无需手动管理状态同步

2. **组件无侵入**
   - `connect` + `mapProps` 适配任意组件
   - 不修改第三方组件源码
   - 保持组件库原有 API

3. **灵活的渲染方式**
   - JSX 模式:直观、类型安全
   - Schema 模式:可配置、可序列化
   - 两种模式可以混用

4. **完善的 Hooks 体系**
   - `useForm`、`useField` 等访问状态
   - 在任意组件层级访问表单/字段
   - 支持嵌套表单场景

5. **强大的扩展性**
   - 自定义 mapProps 逻辑
   - 自定义 connect 行为
   - 插件化的组件注册

### 使用场景

- ✅ **中后台表单**: 复杂的业务表单,大量字段联动
- ✅ **动态表单**: 表单结构由服务端返回
- ✅ **多组件库**: 需要绑定多个 UI 组件库
- ✅ **自定义组件**: 需要集成自研组件
- ✅ **表单设计器**: 基于 Schema 的可视化设计器

### 学习路线

```
1. 理解响应式系统
   ↓
2. 掌握 connect/mapProps
   ↓
3. 学习 Field 组件使用
   ↓
4. 实践组件库绑定
   ↓
5. 深入 SchemaField 原理
   ↓
6. 自定义高级组件
```

通过本文档,你应该已经掌握了 @formily/react 的设计思想和组件绑定机制,可以开始在项目中实践了! 🎉
