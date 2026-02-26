# Formily Core 设计详解

> @formily/core 是 Formily 的核心库，提供了表单状态管理、字段模型、校验引擎、联动机制等核心功能。它是一个框架无关的纯 JavaScript 库，可以独立使用或与 React/Vue 等框架集成。

## 目录

- [1. 设计理念](#1-设计理念)
- [2. Form 模型](#2-form-模型)
- [3. Field 模型](#3-field-模型)
- [4. Effects 副作用机制](#4-effects-副作用机制)
- [5. Reactions 联动机制](#5-reactions-联动机制)
- [6. Validator 校验引擎](#6-validator-校验引擎)
- [7. 生命周期系统](#7-生命周期系统)
- [8. 路径系统](#8-路径系统)
- [9. 响应式系统集成](#9-响应式系统集成)
- [10. 实战案例](#10-实战案例)

---

## 1. 设计理念

### 1.1 核心思想

@formily/core 采用了以下设计理念：

1. **MVVM 架构**：Model（Form/Field）与 View 解耦；
2. **响应式驱动**：基于 @formily/reactive 实现自动依赖追踪；
3. **领域建模**：Form 和 Field 是完整的领域模型；
4. **路径系统**：通过路径访问和操作任意深度的字段；
5. **副作用隔离**：通过 Effects 机制管理副作用；
6. **类型安全**：完整的 TypeScript 类型定义；

### 1.2 架构图

```
┌──────────────────────────────────────────────────────────┐
│                    @formily/core                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Form (表单模型)                     │    │
│  │  • values: 表单值                                │    │
│  │  • initialValues: 初始值                         │    │
│  │  • submit(): 提交                                │    │
│  │  • validate(): 校验                              │    │
│  │  • reset(): 重置                                 │    │
│  │  • setValues(): 设置值                           │    │
│  │  • query(): 查询字段                             │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                                │
│                          │ 包含                           │
│                          ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Field (字段模型)                    │    │
│  │  • value: 字段值                                 │    │
│  │  • errors: 错误信息                              │    │
│  │  • visible: 可见性                               │    │
│  │  • disabled: 禁用状态                            │    │
│  │  • required: 必填                                │    │
│  │  • validate(): 校验                              │    │
│  │  • setState(): 设置状态                          │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                                │
│         ┌────────────────┴────────────────┐              │
│         │                                 │              │
│         ▼                                  ▼              │
│  ┌─────────────┐                  ┌─────────────┐       │
│  │  Effects    │                  │  Reactions  │       │
│  │  副作用机制   │                  │  联动机制    │       │
│  └─────────────┘                  └─────────────┘       │
│         │                                  │              │
│         └────────────────┬─────────────────┘              │
│                          ▼                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │          @formily/reactive                      │    │
│  │          (响应式系统)                            │    │
│  │  • observable(): 创建响应式对象                  │    │
│  │  • autorun(): 自动追踪依赖                       │    │
│  │  • reaction(): 响应式副作用                      │    │
│  │  • batch(): 批量更新                             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Form 模型

### 2.1 创建 Form

```typescript
import { createForm } from '@formily/core'

const form = createForm({
  // 初始值
  initialValues: {
    username: '',
    password: ''
  },

  // 副作用
  effects() {
    onFieldValueChange('username', (field) => {
      console.log('用户名变化:', field.value)
    })
  },

  // 校验规则
  validateFirst: true  // 遇到第一个错误就停止
})
```

### 2.2 Form 核心属性

```typescript
interface IFormState {
  // ===== 数据相关 =====
  values: any                    // 表单当前值
  initialValues: any             // 表单初始值
  modified: boolean              // 是否被修改过

  // ===== 状态相关 =====
  valid: boolean                 // 是否校验通过
  invalid: boolean               // 是否校验失败
  errors: IFormFeedback[]        // 错误列表
  warnings: IFormFeedback[]      // 警告列表
  successes: IFormFeedback[]     // 成功提示列表

  // ===== 交互状态 =====
  validating: boolean            // 是否正在校验
  submitting: boolean            // 是否正在提交
  loading: boolean               // 是否加载中

  // ===== 模式相关 =====
  pattern: 'editable' | 'disabled' | 'readOnly' | 'readPretty'
  display: 'visible' | 'hidden' | 'none'
  editable: boolean
  disabled: boolean
  readOnly: boolean
  readPretty: boolean
  visible: boolean
  hidden: boolean
}
```

### 2.3 Form 核心方法

#### 2.3.1 数据操作

```typescript
// 设置表单值
form.setValues({ username: '张三', age: 18 })

// 设置初始值
form.setInitialValues({ username: '李四' })

// 获取表单值
const values = form.values

// 重置表单
form.reset()

// 清空表单
form.reset({ forceClear: true })
```

#### 2.3.2 字段查询

```typescript
// 查询单个字段
const field = form.query('username').take()

// 查询多个字段
const fields = form.query('users.*.name').map()

// 条件查询
form.query('*').forEach((field) => {
  if (field.required) {
    console.log(field.path)
  }
})
```

#### 2.3.3 表单提交

```typescript
// 提交表单
form.submit(async (values) => {
  console.log('提交数据:', values)
  await api.submitForm(values)
})

// 捕获错误
form.submit(
  (values) => {
    console.log('成功:', values)
  }
).catch((errors) => {
  console.log('校验失败:', errors)
})
```

#### 2.3.4 校验

```typescript
// 校验整个表单
await form.validate()

// 校验指定字段
await form.query('username').take().validate()

// 清空校验结果
form.clearErrors()
```

### 2.4 Form 实战示例

```typescript
import { createForm, onFieldValueChange, onFormSubmit } from '@formily/core'

const form = createForm({
  initialValues: {
    username: '',
    password: '',
    confirmPassword: ''
  },

  effects() {
    // 监听密码变化
    onFieldValueChange('password', (field) => {
      // 清空确认密码的校验
      form.clearErrors('confirmPassword')
    })

    // 监听确认密码变化
    onFieldValueChange('confirmPassword', (field) => {
      const password = form.values.password
      const confirmPassword = field.value

      if (password !== confirmPassword) {
        field.setFeedback({
          type: 'error',
          messages: ['两次密码输入不一致']
        })
      }
    })

    // 提交前的处理
    onFormSubmit((form) => {
      console.log('即将提交表单:', form.values)
    })
  }
})

// 使用表单
form.setValues({ username: '张三' })

await form.submit((values) => {
  console.log('提交成功:', values)
})
```

---

## 3. Field 模型

### 3.1 创建 Field

Field 通常不直接创建，而是通过 Form 的 API 或 React 组件自动创建：

```typescript
// 方式 1: 通过 createField
const field = form.createField({
  name: 'username',
  title: '用户名',
  required: true,
  validator: [
    {
      required: true,
      message: '请输入用户名'
    }
  ]
})

// 方式 2: 在 React 中使用
<Field
  name="username"
  title="用户名"
  required
  component={[Input]}
  decorator={[FormItem]}
/>
```

### 3.2 Field 核心属性

```typescript
interface IFieldState {
  // ===== 基础信息 =====
  name: string                   // 字段名称
  title: string                  // 字段标题
  description: string            // 字段描述
  path: string                   // 字段路径（如 'users.0.name'）

  // ===== 数据相关 =====
  value: any                     // 字段值
  initialValue: any              // 初始值
  inputValue: any                // 输入值（未经转换）
  modified: boolean              // 是否被修改过

  // ===== 校验相关 =====
  valid: boolean                 // 是否校验通过
  invalid: boolean               // 是否校验失败
  errors: IFormFeedback[]        // 错误信息
  warnings: IFormFeedback[]      // 警告信息
  validating: boolean            // 是否正在校验
  validator: IValidator[]        // 校验规则

  // ===== 状态相关 =====
  visible: boolean               // 是否可见
  hidden: boolean                // 是否隐藏（占位）
  display: 'visible' | 'hidden' | 'none'
  disabled: boolean              // 是否禁用
  readOnly: boolean              // 是否只读
  readPretty: boolean            // 是否阅读态
  editable: boolean              // 是否可编辑
  required: boolean              // 是否必填

  // ===== UI 相关 =====
  loading: boolean               // 是否加载中
  component: any[]               // 渲染组件
  decorator: any[]               // 装饰器组件
  componentProps: any            // 组件属性
  decoratorProps: any            // 装饰器属性

  // ===== 数据结构相关 =====
  dataSource: any[]              // 数据源（用于 Select 等）
  selfErrors: IFormFeedback[]    // 自身错误（不包括子字段）
}
```

### 3.3 Field 核心方法

#### 3.3.1 状态设置

```typescript
// 设置字段值
field.setValue('新值')

// 设置字段状态
field.setState({
  visible: false,
  disabled: true
})

// 设置多个状态
field.setState((state) => {
  state.visible = false
  state.title = '新标题'
})

// 设置反馈信息
field.setFeedback({
  type: 'error',
  messages: ['字段校验失败']
})
```

#### 3.3.2 校验

```typescript
// 校验字段
await field.validate()

// 自定义校验
field.setValidator([
  {
    validator: (value) => {
      if (value.length < 6) {
        return '密码长度不能少于6位'
      }
    }
  }
])

// 清空错误
field.clearErrors()
```

#### 3.3.3 查询操作

```typescript
// 查询相对路径字段
const siblingField = field.query('.siblingName').take()

// 查询父级字段
const parentField = field.query('..').take()

// 查询根路径字段
const rootField = field.query('rootFieldName').take()
```

### 3.4 Field 类型

Formily 支持不同类型的字段：

#### 3.4.1 普通字段（Field）

```typescript
form.createField({
  name: 'username',
  value: '张三'
})
```

#### 3.4.2 对象字段（ObjectField）

```typescript
form.createObjectField({
  name: 'address',
  value: {
    province: '北京',
    city: '朝阳区'
  }
})
```

#### 3.4.3 数组字段（ArrayField）

```typescript
form.createArrayField({
  name: 'tags',
  value: ['tag1', 'tag2', 'tag3']
})
```

#### 3.4.4 虚拟字段（VoidField）

```typescript
// 用于布局，不存储数据
form.createVoidField({
  name: 'layout'
})
```

### 3.5 Field 实战示例

```typescript
// 创建动态字段
const dynamicField = form.createField({
  name: 'dynamic',
  title: '动态字段',
  reactions: [
    {
      dependencies: ['.type'],
      fulfill: {
        state: {
          // 根据 type 字段动态设置组件
          component: "{{$deps[0] === 'text' ? 'Input' : 'Select'}}"
        }
      }
    }
  ]
})

// 设置数据源
dynamicField.setDataSource([
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' }
])

// 动态校验
dynamicField.setValidator([
  {
    validator: async (value) => {
      // 异步校验
      const exists = await checkUsernameExists(value)
      if (exists) {
        return '用户名已存在'
      }
    }
  }
])
```

---

## 4. Effects 副作用机制

### 4.1 什么是 Effects？

Effects 是 Formily 中管理副作用的机制，用于：
1. 监听表单/字段的生命周期事件
2. 实现复杂的字段联动
3. 执行异步操作
4. 与外部系统交互

### 4.2 Effects 类型

#### 4.2.1 Form Effects（表单级副作用）

```typescript
import { createForm, onFormInit, onFormMount, onFormValuesChange } from '@formily/core'

const form = createForm({
  effects() {
    // 表单初始化
    onFormInit((form) => {
      console.log('表单初始化')
    })

    // 表单挂载
    onFormMount((form) => {
      console.log('表单挂载到 DOM')
    })

    // 表单值变化
    onFormValuesChange((form) => {
      console.log('表单值变化:', form.values)
    })

    // 表单提交
    onFormSubmit((form) => {
      console.log('表单提交:', form.values)
    })

    // 表单校验
    onFormValidateStart((form) => {
      console.log('开始校验')
    })

    onFormValidateSuccess((form) => {
      console.log('校验成功')
    })

    onFormValidateFailed((form) => {
      console.log('校验失败:', form.errors)
    })
  }
})
```

#### 4.2.2 Field Effects（字段级副作用）

```typescript
import { onFieldValueChange, onFieldInit, onFieldReact } from '@formily/core'

const form = createForm({
  effects() {
    // 监听字段值变化
    onFieldValueChange('username', (field) => {
      console.log('用户名变化:', field.value)
    })

    // 监听字段初始化
    onFieldInit('password', (field) => {
      console.log('密码字段初始化')
    })

    // 字段响应式联动
    onFieldReact('confirmPassword', (field) => {
      // 自动追踪依赖
      const password = field.query('.password').value()
      if (password !== field.value) {
        field.setErrors(['两次密码不一致'])
      } else {
        field.clearErrors()
      }
    })

    // 支持通配符
    onFieldValueChange('users.*.name', (field) => {
      console.log('某个用户的名字变化:', field.path, field.value)
    })

    // 监听所有字段
    onFieldValueChange('*', (field) => {
      console.log('任意字段变化:', field.path)
    })
  }
})
```

### 4.3 生命周期 Hooks 完整列表

#### 4.3.1 Form 生命周期

| Hook | 触发时机 | 说明 |
|------|----------|------|
| `onFormInit` | 表单实例创建 | 只触发一次 |
| `onFormMount` | 表单挂载到 DOM | 可能触发多次 |
| `onFormUnmount` | 表单从 DOM 卸载 | - |
| `onFormValuesChange` | 表单值变化 | 任意字段值变化都会触发 |
| `onFormInitialValuesChange` | 初始值变化 | - |
| `onFormInputChange` | 用户输入导致的值变化 | 区别于程序设置的值 |
| `onFormSubmit` | 表单提交 | - |
| `onFormSubmitStart` | 提交开始 | - |
| `onFormSubmitEnd` | 提交结束 | 无论成功失败 |
| `onFormSubmitSuccess` | 提交成功 | - |
| `onFormSubmitFailed` | 提交失败 | - |
| `onFormValidateStart` | 校验开始 | - |
| `onFormValidateSuccess` | 校验成功 | - |
| `onFormValidateFailed` | 校验失败 | - |
| `onFormValidateEnd` | 校验结束 | - |
| `onFormReset` | 表单重置 | - |
| `onFormGraphChange` | 字段树结构变化 | 添加/删除字段时触发 |

#### 4.3.2 Field 生命周期

| Hook | 触发时机 | 说明 |
|------|----------|------|
| `onFieldInit` | 字段初始化 | 只触发一次 |
| `onFieldMount` | 字段挂载 | - |
| `onFieldUnmount` | 字段卸载 | - |
| `onFieldValueChange` | 字段值变化 | - |
| `onFieldInitialValueChange` | 初始值变化 | - |
| `onFieldInputValueChange` | 输入值变化 | 未经过转换的原始输入 |
| `onFieldValidateStart` | 字段校验开始 | - |
| `onFieldValidateSuccess` | 字段校验成功 | - |
| `onFieldValidateFailed` | 字段校验失败 | - |
| `onFieldValidateEnd` | 字段校验结束 | - |
| `onFieldReact` | 响应式联动 | 自动追踪依赖 |

### 4.4 Effects 源码分析

让我们看看 Effects 是如何实现的：

```typescript
// 源码：packages/core/src/effects/onFormEffects.ts

// 创建表单级 Effect Hook
function createFormEffect(type: LifeCycleTypes) {
  return createEffectHook(
    type,
    (form: Form) => (callback: (form: Form) => void) => {
      batch(() => {
        callback(form)
      })
    }
  )
}

// 导出各种 Form Effects
export const onFormInit = createFormEffect(LifeCycleTypes.ON_FORM_INIT)
export const onFormMount = createFormEffect(LifeCycleTypes.ON_FORM_MOUNT)
export const onFormValuesChange = createFormEffect(LifeCycleTypes.ON_FORM_VALUES_CHANGE)
// ... 其他 hooks

// onFormReact 是一个特殊的 hook，使用 autorun 自动追踪依赖
export function onFormReact(callback?: (form: Form) => void) {
  let dispose = null
  onFormInit((form) => {
    // 创建响应式追踪
    dispose = autorun(() => {
      if (isFn(callback)) callback(form)
    })
  })
  onFormUnmount(() => {
    // 清理
    dispose()
  })
}
```

**工作原理**：
1. Form/Field 在特定时机触发生命周期事件
2. Effects 系统收集所有注册的回调函数
3. 事件触发时，批量执行回调函数
4. 使用 `batch()` 优化性能，避免多次渲染

### 4.5 Effects 实战案例

#### 案例 1：表单自动保存

```typescript
const form = createForm({
  effects() {
    // 自动保存
    let timer = null
    onFieldValueChange('*', (field) => {
      // 防抖：用户停止输入 1 秒后保存
      clearTimeout(timer)
      timer = setTimeout(async () => {
        try {
          await api.saveForm(field.form.values)
          console.log('自动保存成功')
        } catch (error) {
          console.error('自动保存失败', error)
        }
      }, 1000)
    })
  }
})
```

#### 案例 2：级联地址选择

```typescript
const form = createForm({
  effects() {
    // 省份变化时，加载城市数据
    onFieldValueChange('province', async (field) => {
      const province = field.value
      if (!province) return

      // 清空城市和区县
      field.form.setFieldState('city', state => {
        state.value = undefined
        state.dataSource = []
      })
      field.form.setFieldState('district', state => {
        state.value = undefined
        state.dataSource = []
      })

      // 加载城市数据
      const cities = await api.getCitiesByProvince(province)
      field.form.setFieldState('city', state => {
        state.dataSource = cities
      })
    })

    // 城市变化时，加载区县数据
    onFieldValueChange('city', async (field) => {
      const city = field.value
      if (!city) return

      // 清空区县
      field.form.setFieldState('district', state => {
        state.value = undefined
      })

      // 加载区县数据
      const districts = await api.getDistrictsByCity(city)
      field.form.setFieldState('district', state => {
        state.dataSource = districts
      })
    })
  }
})
```

#### 案例 3：动态显示/隐藏字段

```typescript
const form = createForm({
  effects() {
    // 根据用户类型显示不同字段
    onFieldValueChange('userType', (field) => {
      const userType = field.value

      if (userType === 'personal') {
        // 个人用户：显示身份证，隐藏企业信息
        field.form.setFieldState('idCard', state => {
          state.visible = true
          state.required = true
        })
        field.form.setFieldState('companyName', state => {
          state.visible = false
          state.value = undefined
        })
        field.form.setFieldState('taxNumber', state => {
          state.visible = false
          state.value = undefined
        })
      } else if (userType === 'enterprise') {
        // 企业用户：显示企业信息，隐藏身份证
        field.form.setFieldState('idCard', state => {
          state.visible = false
          state.value = undefined
        })
        field.form.setFieldState('companyName', state => {
          state.visible = true
          state.required = true
        })
        field.form.setFieldState('taxNumber', state => {
          state.visible = true
          state.required = true
        })
      }
    })
  }
})
```

#### 案例 4：字段联动计算

```typescript
const form = createForm({
  effects() {
    // 计算订单总价
    onFieldReact('totalPrice', (field) => {
      // 自动追踪 quantity 和 unitPrice 的变化
      const quantity = field.query('.quantity').value() || 0
      const unitPrice = field.query('.unitPrice').value() || 0
      const discount = field.query('.discount').value() || 0

      // 计算总价
      const subtotal = quantity * unitPrice
      const discountAmount = subtotal * (discount / 100)
      field.value = subtotal - discountAmount
    })

    // 另一种写法：使用 onFieldValueChange
    onFieldValueChange('quantity', (field) => {
      updateTotalPrice(field.form)
    })
    onFieldValueChange('unitPrice', (field) => {
      updateTotalPrice(field.form)
    })
    onFieldValueChange('discount', (field) => {
      updateTotalPrice(field.form)
    })

    function updateTotalPrice(form) {
      const quantity = form.values.quantity || 0
      const unitPrice = form.values.unitPrice || 0
      const discount = form.values.discount || 0

      const subtotal = quantity * unitPrice
      const discountAmount = subtotal * (discount / 100)
      form.setFieldState('totalPrice', state => {
        state.value = subtotal - discountAmount
      })
    }
  }
})
```

### 4.6 Effects vs Reactions

| 特性 | Effects | Reactions |
|------|---------|-----------|
| 定义位置 | Form 创建时 | Field Schema 中 |
| 作用范围 | 全局（可访问所有字段） | 局部（主要影响当前字段） |
| 适用场景 | 复杂业务逻辑、异步操作 | 简单的字段联动 |
| 声明方式 | 命令式（代码） | 声明式（JSON Schema） |
| 依赖追踪 | 手动指定路径 | 自动追踪（onFieldReact） |
| 可序列化 | 不可序列化 | 可序列化（JSON） |

**选择建议**：
- 简单联动、可配置化场景 → 使用 Reactions
- 复杂业务逻辑、异步操作 → 使用 Effects
- 可以同时使用两者

---

## 5. Reactions 联动机制

详见 [x-reactions 联动机制](./03-formily-x-reactions.md) 和 [JSON Schema 设计详解](./02-formily-json-schema.md#5-x-reactions-联动机制)

### 5.1 快速回顾

```typescript
// 在 Field Schema 中使用
{
  name: 'city',
  'x-reactions': {
    dependencies: ['.province'],
    fulfill: {
      state: {
        visible: "{{$deps[0] !== undefined}}"
      },
      schema: {
        'x-component-props': {
          options: "{{getCitiesByProvince($deps[0])}}"
        }
      }
    }
  }
}

// 在 Effects 中使用
form.addEffects('reactions', () => {
  onFieldReact('city', (field) => {
    const province = field.query('.province').value()
    field.visible = province !== undefined
    field.setDataSource(getCitiesByProvince(province))
  })
})
```

---

## 6. Validator 校验引擎

### 6.1 内置校验规则

```typescript
const field = form.createField({
  name: 'username',
  validator: [
    // 必填
    { required: true, message: '请输入用户名' },

    // 最小长度
    { min: 3, message: '用户名至少3个字符' },

    // 最大长度
    { max: 20, message: '用户名最多20个字符' },

    // 精确长度
    { len: 11, message: '手机号必须是11位' },

    // 正则表达式
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' },

    // 枚举值
    { enum: ['admin', 'user', 'guest'], message: '无效的角色' },

    // 格式校验
    { format: 'email', message: '请输入有效的邮箱' },
    { format: 'url', message: '请输入有效的URL' },
    { format: 'ipv4', message: '请输入有效的IPv4地址' },

    // 数值范围
    { minimum: 0, message: '不能小于0' },
    { maximum: 100, message: '不能大于100' },

    // 空格校验
    { whitespace: true, message: '不能只包含空格' },
  ]
})
```

### 6.2 自定义校验函数

```typescript
const field = form.createField({
  name: 'password',
  validator: [
    // 同步校验
    {
      validator(value) {
        if (!/[A-Z]/.test(value)) {
          return '密码必须包含大写字母'
        }
        if (!/[0-9]/.test(value)) {
          return '密码必须包含数字'
        }
      }
    },

    // 异步校验
    {
      async validator(value) {
        const exists = await api.checkUsernameExists(value)
        if (exists) {
          return '用户名已存在'
        }
      }
    },

    // 访问字段对象
    {
      validator(value, rule, ctx) {
        const field = ctx.field
        const form = field.form

        const confirmPassword = form.values.confirmPassword
        if (value !== confirmPassword) {
          return '两次密码输入不一致'
        }
      }
    }
  ]
})
```

### 6.3 校验触发时机

```typescript
const field = form.createField({
  name: 'username',

  // 校验触发器
  validateFirst: true,  // 遇到第一个错误就停止

  // 校验时机
  validator: {
    triggerType: 'onInput',  // onInput | onFocus | onBlur
    rules: [
      { required: true, message: '请输入用户名' }
    ]
  }
})
```

### 6.4 校验格式化

```typescript
// 自定义错误消息模板
const field = form.createField({
  name: 'age',
  validator: [
    {
      minimum: 18,
      maximum: 60,
      message: '年龄必须在 {{minimum}} 到 {{maximum}} 之间'
    }
  ]
})

// 使用函数生成消息
const field = form.createField({
  name: 'username',
  validator: [
    {
      min: 3,
      message: (value, rule) => {
        return `用户名长度不能少于${rule.min}个字符，当前${value.length}个`
      }
    }
  ]
})
```

### 6.5 联合校验

```typescript
const form = createForm({
  effects() {
    // 确认密码校验
    onFieldValueChange('password', (field) => {
      // 触发确认密码字段的校验
      field.form.query('confirmPassword').take().validate()
    })

    onFieldValueChange('confirmPassword', (field) => {
      const password = field.form.values.password
      if (password !== field.value) {
        field.setErrors(['两次密码输入不一致'])
      } else {
        field.clearErrors()
      }
    })
  }
})
```

---

## 7. 生命周期系统

### 7.1 生命周期流程图

```
┌─────────────────────────────────────────────────────────┐
│                    Form 生命周期                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  onFormInit  │  表单实例创建
                  └──────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │ onFormMount  │  表单挂载
                 └──────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌────────────────────┐           ┌─────────────────────┐
│ onFormValuesChange │           │  onFormSubmit       │
│ (值变化时)          │           │  (提交时)            │
└────────────────────┘           └─────────────────────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     ▼                    ▼                    ▼
          ┌─────────────────────┐  ┌───────────────────┐  ┌──────────────────┐
          │ onFormValidateStart │  │ onFormSubmitStart │  │ onFormSubmitEnd  │
          └─────────────────────┘  └───────────────────┘  └──────────────────┘
                     │                   │
        ┌────────────┴────────────┐      └─────┬─────────────┐
        │                         │            │             │
        ▼                         ▼            ▼             ▼
┌─────────────────┐    ┌──────────────────┐  ┌────────┐  ┌────────┐
│onFormValidate   │    │onFormValidate    │  │Success │  │Failed  │
│Success          │    │Failed            │  └────────┘  └────────┘
└─────────────────┘    └──────────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │onFormUnmount │  表单卸载
                 └──────────────┘
```

### 7.2 Field 生命周期流程

```
┌─────────────────────────────────────────────────────────┐
│                   Field 生命周期                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ onFieldInit  │  字段初始化
                  └──────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │onFieldMount  │  字段挂载
                 └──────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐           ┌──────────────────────┐
│onFieldValueChange│           │ onFieldReact         │
│(值变化)           │           │ (响应式联动)           │
└──────────────────┘           └──────────────────────┘
        │
        └──────────► 触发校验
                          │
                          ▼
                 ┌────────────────────┐
                 │onFieldValidateStart│
                 └────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
     ┌─────────────────┐   ┌──────────────────┐
     │onFieldValidate  │   │onFieldValidate   │
     │Success          │   │Failed            │
     └─────────────────┘   └──────────────────┘
                          │
                          ▼
                 ┌──────────────┐
                 │onFieldUnmount│  字段卸载
                 └──────────────┘
```

---

## 8. 路径系统

### 8.1 路径语法

Formily 使用强大的路径系统来访问和操作字段：

```typescript
// 绝对路径
'username'              // 根级字段
'user.name'             // 嵌套对象
'users.0.name'          // 数组索引
'users.0.tags.1'        // 多级嵌套

// 相对路径
'.siblingField'         // 同级字段
'..parentField'         // 父级字段
'...grandParentField'   // 祖父级字段

// 通配符
'*'                     // 所有一级字段
'users.*'               // users 下所有字段
'users.*.name'          // 所有用户的 name
'**.name'               // 所有层级的 name 字段
```

### 8.2 路径查询 API

```typescript
// query(): 查询字段
const field = form.query('user.name').take()        // 获取单个
const fields = form.query('users.*.name').map()     // 获取多个

// take(): 获取第一个匹配的字段
const firstField = form.query('*').take()

// map(): 获取所有匹配的字段
const allFields = form.query('*').map()

// forEach(): 遍历所有匹配的字段
form.query('users.*').forEach((field) => {
  console.log(field.path, field.value)
})

// reduce(): 聚合字段
const total = form.query('items.*.price').reduce((sum, field) => {
  return sum + (field.value || 0)
}, 0)

// value(): 直接获取值
const username = form.query('username').value()

// get(): 获取字段状态
const visible = form.query('username').get('visible')
```

### 8.3 路径操作示例

```typescript
const form = createForm({
  values: {
    users: [
      { name: '张三', age: 18 },
      { name: '李四', age: 20 }
    ]
  },

  effects() {
    // 查询所有用户的名字
    const names = form.query('users.*.name').map((field) => field.value)
    console.log(names)  // ['张三', '李四']

    // 设置所有用户的年龄
    form.query('users.*.age').forEach((field) => {
      field.setValue(field.value + 1)
    })

    // 监听所有用户名的变化
    onFieldValueChange('users.*.name', (field) => {
      console.log('用户名变化:', field.path, field.value)
    })

    // 相对路径查询
    onFieldInit('users.0.name', (field) => {
      // 查询同级的 age 字段
      const ageField = field.query('.age').take()
      console.log('年龄:', ageField.value)

      // 查询父级字段
      const userField = field.query('..').take()
      console.log('用户对象:', userField.value)

      // 查询根字段
      const usersField = field.query('users').take()
      console.log('所有用户:', usersField.value)
    })
  }
})
```

---

## 9. 响应式系统集成

### 9.1 基于 @formily/reactive

@formily/core 底层基于 @formily/reactive 实现响应式：

```typescript
import { observable, autorun, reaction, batch } from '@formily/reactive'

// Form 和 Field 的状态都是响应式的
const form = createForm()
const field = form.createField({ name: 'username' })

// 自动追踪依赖
autorun(() => {
  console.log('用户名:', field.value)
  console.log('表单值:', form.values)
})

// 修改会自动触发 autorun
field.setValue('张三')  // 输出: 用户名: 张三
```

### 9.2 批量更新优化

```typescript
import { batch } from '@formily/reactive'

// 批量更新，只触发一次渲染
batch(() => {
  form.setFieldState('username', state => {
    state.value = '张三'
  })
  form.setFieldState('age', state => {
    state.value = 18
  })
  form.setFieldState('email', state => {
    state.value = 'zhangsan@example.com'
  })
})
// 渲染只会在 batch 结束后触发一次
```

### 9.3 计算属性

```typescript
const form = createForm({
  effects() {
    // 使用 onFieldReact 实现计算属性
    onFieldReact('fullName', (field) => {
      // 自动追踪 firstName 和 lastName 的依赖
      const firstName = field.query('.firstName').value()
      const lastName = field.query('.lastName').value()
      field.value = `${firstName} ${lastName}`
    })

    // 另一种方式：使用 reaction
    onFieldInit('fullName', (field) => {
      reaction(
        () => {
          return {
            firstName: form.values.firstName,
            lastName: form.values.lastName
          }
        },
        ({ firstName, lastName }) => {
          field.setValue(`${firstName} ${lastName}`)
        }
      )
    })
  }
})
```

---

## 10. 实战案例

### 10.1 案例：用户注册表单

完整示例参考：[examples/formily-demo/src/examples/](../../examples/formily-demo/src/examples/)

```typescript
import { createForm, onFieldValueChange, onFieldReact, onFormSubmit } from '@formily/core'

const registerForm = createForm({
  initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    agreeTerm: false
  },

  effects() {
    // 1. 用户名实时校验
    onFieldValueChange('username', async (field) => {
      if (!field.value) return

      // 防抖
      clearTimeout(field.data.timer)
      field.data.timer = setTimeout(async () => {
        const exists = await api.checkUsername(field.value)
        if (exists) {
          field.setErrors(['用户名已存在'])
        } else {
          field.clearErrors()
        }
      }, 300)
    })

    // 2. 密码强度检测
    onFieldValueChange('password', (field) => {
      const password = field.value
      let strength = 0

      if (/[a-z]/.test(password)) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^a-zA-Z0-9]/.test(password)) strength++

      // 设置密码强度字段
      field.form.setFieldState('passwordStrength', state => {
        state.value = strength
        state.componentProps = {
          ...state.componentProps,
          percent: strength * 25,
          status: strength >= 3 ? 'success' : 'exception'
        }
      })

      // 触发确认密码校验
      field.form.query('confirmPassword').take()?.validate()
    })

    // 3. 确认密码校验
    onFieldReact('confirmPassword', (field) => {
      const password = field.query('.password').value()
      if (field.value && password !== field.value) {
        field.setErrors(['两次密码输入不一致'])
      } else {
        field.clearErrors()
      }
    })

    // 4. 手机号和邮箱二选一
    onFieldValueChange('phone', (field) => {
      const email = field.form.values.email
      if (field.value && email) {
        // 如果填了手机号，邮箱变为非必填
        field.form.setFieldState('email', state => {
          state.required = false
        })
      } else if (!field.value && !email) {
        // 都没填，邮箱变为必填
        field.form.setFieldState('email', state => {
          state.required = true
        })
      }
    })

    onFieldValueChange('email', (field) => {
      const phone = field.form.values.phone
      if (field.value && phone) {
        field.form.setFieldState('phone', state => {
          state.required = false
        })
      } else if (!field.value && !phone) {
        field.form.setFieldState('phone', state => {
          state.required = true
        })
      }
    })

    // 5. 提交前检查
    onFormSubmit(async (form) => {
      if (!form.values.agreeTerm) {
        throw new Error('请先同意用户协议')
      }

      try {
        const result = await api.register(form.values)
        console.log('注册成功:', result)
        // 跳转到登录页
        router.push('/login')
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    })
  }
})

// 使用表单
await registerForm.submit()
```

### 10.2 案例：动态表单

```typescript
const dynamicForm = createForm({
  effects() {
    // 根据表单类型动态显示字段
    onFieldValueChange('formType', (field) => {
      const formType = field.value

      // 清空所有动态字段
      field.form.query('dynamicFields.*').forEach(f => {
        f.destroy()
      })

      // 根据类型创建字段
      if (formType === 'personal') {
        field.form.createField({
          basePath: 'dynamicFields',
          name: 'idCard',
          title: '身份证号',
          required: true
        })
        field.form.createField({
          basePath: 'dynamicFields',
          name: 'realName',
          title: '真实姓名',
          required: true
        })
      } else if (formType === 'enterprise') {
        field.form.createField({
          basePath: 'dynamicFields',
          name: 'companyName',
          title: '企业名称',
          required: true
        })
        field.form.createField({
          basePath: 'dynamicFields',
          name: 'taxNumber',
          title: '税号',
          required: true
        })
        field.form.createField({
          basePath: 'dynamicFields',
          name: 'businessLicense',
          title: '营业执照',
          required: true
        })
      }
    })
  }
})
```

### 10.3 案例：表单数组操作

```typescript
const arrayForm = createForm({
  values: {
    items: []
  },

  effects() {
    // 监听数组变化，更新总价
    onFieldReact('totalPrice', (field) => {
      const items = field.query('items').value() || []
      const total = items.reduce((sum, item) => {
        return sum + (item.quantity || 0) * (item.price || 0)
      }, 0)
      field.value = total
    })

    // 监听每一项的数量和单价变化
    onFieldValueChange('items.*.quantity', (field) => {
      updateItemSubtotal(field)
    })

    onFieldValueChange('items.*.price', (field) => {
      updateItemSubtotal(field)
    })

    function updateItemSubtotal(field) {
      // 获取当前项的索引
      const index = field.address.segments[1]

      // 计算小计
      const quantity = field.form.values.items[index]?.quantity || 0
      const price = field.form.values.items[index]?.price || 0

      // 设置小计字段
      field.form.setFieldState(`items.${index}.subtotal`, state => {
        state.value = quantity * price
      })
    }
  }
})

// 添加项
arrayForm.setFieldState('items', state => {
  state.value = [
    ...state.value,
    { quantity: 1, price: 0, subtotal: 0 }
  ]
})

// 删除项
arrayForm.setFieldState('items', state => {
  state.value = state.value.filter((item, index) => index !== 0)
})
```

---

## 11. 性能优化

### 11.1 批量更新

```typescript
import { batch } from '@formily/reactive'

// 不推荐：每次 setState 都会触发渲染
form.setFieldState('field1', state => { state.value = 'a' })
form.setFieldState('field2', state => { state.value = 'b' })
form.setFieldState('field3', state => { state.value = 'c' })
// 触发 3 次渲染

// 推荐：使用 batch 批量更新
batch(() => {
  form.setFieldState('field1', state => { state.value = 'a' })
  form.setFieldState('field2', state => { state.value = 'b' })
  form.setFieldState('field3', state => { state.value = 'c' })
})
// 只触发 1 次渲染
```

### 11.2 惰性查询

```typescript
// 不推荐：每次都查询
onFieldValueChange('*', (field) => {
  const username = field.form.query('username').value()
  const email = field.form.query('email').value()
  // ...
})

// 推荐：缓存查询结果
const usernameField = form.query('username').take()
const emailField = form.query('email').take()

onFieldValueChange('*', (field) => {
  const username = usernameField.value
  const email = emailField.value
  // ...
})
```

### 11.3 避免不必要的联动

```typescript
// 不推荐：监听所有字段
onFieldValueChange('*', (field) => {
  // 复杂逻辑
})

// 推荐：只监听需要的字段
onFieldValueChange('specificField', (field) => {
  // 复杂逻辑
})
```

---

## 12. 最佳实践

### 12.1 表单设计

✅ **推荐**
- 合理拆分表单（使用 ObjectField 和 VoidField）
- 使用 Effects 处理复杂业务逻辑
- 使用 Reactions 处理简单联动
- 校验规则声明化

❌ **避免**
- 过度嵌套
- 在 Effects 中直接操作 DOM
- 循环依赖
- 过度使用全局监听（`*`）

### 12.2 性能优化

✅ **推荐**
- 使用 batch 批量更新
- 缓存查询结果
- 使用 validateFirst 优先校验
- 合理使用 onFieldReact（自动依赖追踪）

❌ **避免**
- 频繁的 setState
- 在 Effects 中执行耗时操作（应该使用 async/await）
- 不必要的字段联动

### 12.3 代码组织

```typescript
// 推荐：将 Effects 拆分为独立函数
function createUserFormEffects() {
  return () => {
    setupPasswordValidation()
    setupUsernameCheck()
    setupFormAutoSave()
  }
}

function setupPasswordValidation() {
  onFieldValueChange('password', (field) => {
    // 密码校验逻辑
  })
  onFieldReact('confirmPassword', (field) => {
    // 确认密码逻辑
  })
}

function setupUsernameCheck() {
  onFieldValueChange('username', async (field) => {
    // 用户名检查逻辑
  })
}

function setupFormAutoSave() {
  let timer = null
  onFieldValueChange('*', (field) => {
    // 自动保存逻辑
  })
}

const form = createForm({
  effects: createUserFormEffects()
})
```

---

## 13. 参考资源

- [Formily 官方文档](https://formilyjs.org/)
- [Formily GitHub](https://github.com/alibaba/formily)
- [@formily/reactive 文档](https://reactive.formilyjs.org/)
- [示例代码](../../examples/formily-demo/)
- [JSON Schema 设计详解](./02-formily-json-schema.md)
- [x-reactions 联动机制](./03-formily-x-reactions.md)
