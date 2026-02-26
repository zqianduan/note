# @designable/react-settings-form 包详解

## 一、包概述

`@designable/react-settings-form` 提供了属性配置表单组件，用于在设计器右侧面板中配置选中组件的属性。它基于 Formily 实现，支持动态表单和自定义设置器。

### 包信息

- **位置**：`/packages/react-settings-form`
- **依赖**：
  - `@designable/core`（核心引擎）
  - `@designable/react`（React 集成）
  - `@formily/core`（表单核心）
  - `@formily/react`（React 表单）
  - `@formily/antd`（Ant Design 表单组件）
  - `monaco-editor`（代码编辑器）
  - `react-color`（颜色选择器）
- **输出格式**：CJS、ESM、UMD

### 核心模块

```
react-settings-form/
├── components/      # 表单组件（23个）
├── SchemaField.tsx  # Schema 字段组件
├── SettingsForm.tsx # 设置表单组件
├── registry.ts      # 组件注册表
├── effects/         # 表单效果
├── shared/          # 共享工具
└── locales/         # 国际化（6个语言）
```

---

## 二、核心组件

### 2.1 SettingsForm

设置表单的主组件，自动根据选中节点生成属性配置表单。

**核心实现**：

```typescript
import { observer } from '@formily/reactive-react'
import { useSelectedNode } from '@designable/react'
import { createForm } from '@formily/core'
import { Form } from '@formily/antd'
import { SchemaField } from './SchemaField'

export const SettingsForm: React.FC = observer(() => {
  const node = useSelectedNode()

  // 创建表单实例
  const form = useMemo(() => {
    return createForm({
      values: node?.props,
      effects(form) {
        // 监听表单值变化
        onFieldValueChange('*', (field) => {
          if (node) {
            node.props[field.address.toString()] = field.value
          }
        })
      },
    })
  }, [node])

  // 获取节点的设置 Schema
  const schema = useMemo(() => {
    if (!node) return null
    return node.designerLocales?.settings || {}
  }, [node])

  if (!node || !schema) {
    return <Empty description="请选择一个组件" />
  }

  return (
    <Form form={form}>
      <SchemaField schema={schema} />
    </Form>
  )
})
```

**工作流程**：

```
1. 获取选中的节点（useSelectedNode）
   ↓
2. 创建 Formily 表单实例
   ↓
3. 从节点的 designerLocales.settings 获取 Schema
   ↓
4. 渲染 SchemaField
   ↓
5. 监听表单值变化，同步到节点 props
```

### 2.2 SchemaField

Schema 字段组件，负责渲染表单字段。

```typescript
import { createSchemaField } from '@formily/react'
import { Form, FormItem, Input, Select, Switch } from '@formily/antd'
import * as SettingComponents from './components'

export const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    Input,
    Select,
    Switch,
    ...SettingComponents,  // 自定义设置器组件
  },
})
```

---

## 三、内置设置器组件

### 3.1 DataSourceSetter（数据源设置器）

用于配置组件的数据源（如 Select 的 options）。

```typescript
export const DataSourceSetter: React.FC = observer((props) => {
  const [dataSource, setDataSource] = useState(props.value || [])

  const handleAdd = () => {
    setDataSource([...dataSource, { label: '', value: '' }])
  }

  const handleChange = (index: number, key: string, value: any) => {
    const newDataSource = [...dataSource]
    newDataSource[index][key] = value
    setDataSource(newDataSource)
    props.onChange(newDataSource)
  }

  return (
    <div className="data-source-setter">
      {dataSource.map((item, index) => (
        <div key={index} className="data-source-item">
          <Input
            placeholder="标签"
            value={item.label}
            onChange={(e) => handleChange(index, 'label', e.target.value)}
          />
          <Input
            placeholder="值"
            value={item.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
          />
          <Button onClick={() => handleRemove(index)}>删除</Button>
        </div>
      ))}
      <Button onClick={handleAdd}>添加</Button>
    </div>
  )
})
```

**使用示例**：

```typescript
// 在组件的 designerLocales 中配置
designerLocales: {
  'zh-CN': {
    settings: {
      'x-component-props.options': {
        title: '选项',
        'x-decorator': 'FormItem',
        'x-component': 'DataSourceSetter',
      },
    },
  },
}
```

### 3.2 ReactionsSetter（联动设置器）

用于配置字段之间的联动关系。

```typescript
export const ReactionsSetter: React.FC = (props) => {
  const [reactions, setReactions] = useState(props.value || [])

  return (
    <div className="reactions-setter">
      {reactions.map((reaction, index) => (
        <div key={index} className="reaction-item">
          <Select
            placeholder="目标字段"
            value={reaction.target}
            onChange={(value) => handleChange(index, 'target', value)}
          >
            {/* 字段列表 */}
          </Select>
          <Select
            placeholder="条件"
            value={reaction.condition}
            onChange={(value) => handleChange(index, 'condition', value)}
          >
            <Option value="visible">显示/隐藏</Option>
            <Option value="disabled">启用/禁用</Option>
            <Option value="value">设置值</Option>
          </Select>
          <Input
            placeholder="表达式"
            value={reaction.expression}
            onChange={(e) => handleChange(index, 'expression', e.target.value)}
          />
        </div>
      ))}
      <Button onClick={handleAdd}>添加联动</Button>
    </div>
  )
}
```

### 3.3 ValidatorSetter（验证器设置器）

用于配置字段的验证规则。

```typescript
export const ValidatorSetter: React.FC = (props) => {
  const [validators, setValidators] = useState(props.value || [])

  return (
    <div className="validator-setter">
      {validators.map((validator, index) => (
        <div key={index} className="validator-item">
          <Select
            placeholder="验证类型"
            value={validator.type}
            onChange={(value) => handleChange(index, 'type', value)}
          >
            <Option value="required">必填</Option>
            <Option value="pattern">正则</Option>
            <Option value="max">最大值</Option>
            <Option value="min">最小值</Option>
            <Option value="maxLength">最大长度</Option>
            <Option value="minLength">最小长度</Option>
          </Select>
          <Input
            placeholder="验证值"
            value={validator.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
          />
          <Input
            placeholder="错误信息"
            value={validator.message}
            onChange={(e) => handleChange(index, 'message', e.target.value)}
          />
        </div>
      ))}
      <Button onClick={handleAdd}>添加验证</Button>
    </div>
  )
}
```

### 3.4 DisplaySetter（显示设置器）

用于配置字段的显示模式。

```typescript
export const DisplaySetter: React.FC = (props) => {
  return (
    <Radio.Group value={props.value} onChange={(e) => props.onChange(e.target.value)}>
      <Radio value="visible">显示</Radio>
      <Radio value="hidden">隐藏（保留值）</Radio>
      <Radio value="none">不渲染</Radio>
    </Radio.Group>
  )
}
```

### 3.5 其他内置设置器

- **ColorSetter**：颜色选择器
- **SizeSetter**：尺寸设置器
- **PositionSetter**：位置设置器
- **BorderSetter**：边框设置器
- **BackgroundSetter**：背景设置器
- **BoxShadowSetter**：阴影设置器
- **FontSetter**：字体设置器
- **IconSetter**：图标选择器
- **ImageSetter**：图片上传器
- **MonacoInput**：代码编辑器
- **ValueInput**：值输入器
- **ExpressionSetter**：表达式设置器

---

## 四、组件注册机制

### 4.1 注册设置器

```typescript
import { SchemaField } from '@designable/react-settings-form'

// 注册自定义设置器
SchemaField.registerComponent('MyCustomSetter', MyCustomSetter)
```

### 4.2 在 Schema 中使用

```typescript
designerLocales: {
  'zh-CN': {
    settings: {
      'x-component-props.myProp': {
        title: '自定义属性',
        'x-decorator': 'FormItem',
        'x-component': 'MyCustomSetter',
      },
    },
  },
}
```

---

## 五、自定义设置器

### 5.1 创建自定义设置器

```typescript
import React from 'react'
import { observer } from '@formily/reactive-react'

export interface IMySetterProps {
  value?: any
  onChange?: (value: any) => void
}

export const MySetter: React.FC<IMySetterProps> = observer((props) => {
  const { value, onChange } = props

  const handleChange = (newValue: any) => {
    onChange?.(newValue)
  }

  return (
    <div className="my-setter">
      {/* 自定义 UI */}
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
})
```

### 5.2 注册自定义设置器

```typescript
import { SchemaField } from '@designable/react-settings-form'
import { MySetter } from './MySetter'

SchemaField.registerComponent('MySetter', MySetter)
```

### 5.3 使用自定义设置器

```typescript
GlobalRegistry.registerDesignerBehaviors({
  MyComponent: {
    Behavior: [{
      name: 'MyComponent',
      selector: (node) => node.componentName === 'MyComponent',
      designerLocales: {
        'zh-CN': {
          title: '我的组件',
          settings: {
            'x-component-props.customProp': {
              title: '自定义属性',
              'x-decorator': 'FormItem',
              'x-component': 'MySetter',
              'x-component-props': {
                // 传递给 MySetter 的 props
              },
            },
          },
        },
      },
    }],
  },
})
```

---

## 六、完整示例

### 6.1 基础使用

```typescript
import React from 'react'
import { Designer, SettingsPanel } from '@designable/react'
import { SettingsForm } from '@designable/react-settings-form'
import { createDesigner, GlobalRegistry } from '@designable/core'

// 注册组件行为
GlobalRegistry.registerDesignerBehaviors({
  Input: {
    Behavior: [{
      name: 'Input',
      selector: (node) => node.componentName === 'Input',
      designerLocales: {
        'zh-CN': {
          title: '输入框',
          settings: {
            'x-component-props.placeholder': {
              title: '占位符',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
            },
            'x-component-props.maxLength': {
              title: '最大长度',
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
            },
            'x-component-props.disabled': {
              title: '禁用',
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
            },
          },
        },
      },
    }],
  },
})

const engine = createDesigner()

const App = () => {
  return (
    <Designer engine={engine}>
      {/* 其他组件 */}
      <SettingsPanel title="属性配置">
        <SettingsForm />
      </SettingsPanel>
    </Designer>
  )
}
```

### 6.2 复杂配置

```typescript
GlobalRegistry.registerDesignerBehaviors({
  Select: {
    Behavior: [{
      name: 'Select',
      selector: (node) => node.componentName === 'Select',
      designerLocales: {
        'zh-CN': {
          title: '下拉选择',
          settings: {
            // 基础属性
            'x-component-props.placeholder': {
              title: '占位符',
              'x-decorator': 'FormItem',
              'x-component': 'Input',
            },
            'x-component-props.mode': {
              title: '模式',
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              enum: [
                { label: '单选', value: undefined },
                { label: '多选', value: 'multiple' },
                { label: '标签', value: 'tags' },
              ],
            },
            // 数据源
            'x-component-props.options': {
              title: '选项',
              'x-decorator': 'FormItem',
              'x-component': 'DataSourceSetter',
            },
            // 验证规则
            'x-validator': {
              title: '验证规则',
              'x-decorator': 'FormItem',
              'x-component': 'ValidatorSetter',
            },
            // 联动规则
            'x-reactions': {
              title: '联动规则',
              'x-decorator': 'FormItem',
              'x-component': 'ReactionsSetter',
            },
          },
        },
      },
    }],
  },
})
```

### 6.3 自定义设置器示例

```typescript
// 创建一个图标选择器
import { observer } from '@formily/reactive-react'
import { Popover, Button } from 'antd'
import * as Icons from '@ant-design/icons'

export const IconSetter: React.FC = observer((props) => {
  const { value, onChange } = props
  const [visible, setVisible] = useState(false)

  const iconList = Object.keys(Icons).filter(key => key.endsWith('Outlined'))

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    setVisible(false)
  }

  const IconComponent = value ? Icons[value] : null

  return (
    <Popover
      visible={visible}
      onVisibleChange={setVisible}
      content={
        <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
          {iconList.map(iconName => {
            const Icon = Icons[iconName]
            return (
              <Button
                key={iconName}
                onClick={() => handleSelect(iconName)}
                style={{ margin: 4 }}
              >
                <Icon />
              </Button>
            )
          })}
        </div>
      }
      trigger="click"
    >
      <Button>
        {IconComponent ? <IconComponent /> : '选择图标'}
      </Button>
    </Popover>
  )
})

// 注册
SchemaField.registerComponent('IconSetter', IconSetter)

// 使用
designerLocales: {
  'zh-CN': {
    settings: {
      'x-component-props.icon': {
        title: '图标',
        'x-decorator': 'FormItem',
        'x-component': 'IconSetter',
      },
    },
  },
}
```

---

## 七、最佳实践

### 7.1 设置器命名规范

```typescript
// 好的命名
DataSourceSetter
ValidatorSetter
ReactionsSetter

// 不好的命名
DataSource
Validator
Reactions
```

### 7.2 使用 observer

```typescript
// 确保设置器组件使用 observer 包裹
import { observer } from '@formily/reactive-react'

export const MySetter: React.FC = observer((props) => {
  // ...
})
```

### 7.3 处理复杂数据

```typescript
export const ComplexSetter: React.FC = observer((props) => {
  const { value, onChange } = props

  // 使用 useState 管理内部状态
  const [internalValue, setInternalValue] = useState(value)

  // 使用 useEffect 同步外部值
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // 防抖更新
  const debouncedOnChange = useMemo(
    () => debounce(onChange, 300),
    [onChange]
  )

  const handleChange = (newValue: any) => {
    setInternalValue(newValue)
    debouncedOnChange(newValue)
  }

  return (
    // ...
  )
})
```

### 7.4 提供默认值

```typescript
designerLocales: {
  'zh-CN': {
    settings: {
      'x-component-props.size': {
        title: '尺寸',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        default: 'middle',  // 提供默认值
        enum: [
          { label: '大', value: 'large' },
          { label: '中', value: 'middle' },
          { label: '小', value: 'small' },
        ],
      },
    },
  },
}
```

---

## 八、总结

### 核心价值

1. **动态表单**：根据选中节点自动生成配置表单
2. **丰富的设置器**：23+ 个内置设置器组件
3. **可扩展**：支持自定义设置器
4. **响应式**：基于 @formily/reactive-react

### 内置设置器

- **DataSourceSetter**：数据源配置
- **ValidatorSetter**：验证规则配置
- **ReactionsSetter**：联动规则配置
- **DisplaySetter**：显示模式配置
- **ColorSetter**：颜色选择
- **MonacoInput**：代码编辑
- 更多...

### 学习要点

1. 理解 SettingsForm 的工作原理
2. 理解 SchemaField 的注册机制
3. 掌握自定义设置器的开发
4. 掌握 designerLocales.settings 的配置

---

**完成**：至此，Designable 核心包的深度解析已全部完成。建议按顺序阅读所有文档，并结合 [Demo 示例](../demo/) 进行实践。
