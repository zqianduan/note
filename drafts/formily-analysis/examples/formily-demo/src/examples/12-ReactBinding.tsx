import React, { useState } from 'react'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField, connect, mapProps, mapReadPretty } from '@formily/react'
import { FormItem, Input, Switch, FormLayout, Space as FormilySpace } from '@formily/antd'
import { Card, Button, Space, Alert, Divider, Tag, Rate, Slider } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * 组件库绑定示例
 *
 * 本示例展示:
 * 1. connect 的基本用法
 * 2. mapProps 的属性映射
 * 3. mapReadPretty 的阅读态实现
 * 4. 自定义组件的绑定流程
 * 5. 完整的组件库绑定案例
 */

// ==================== 示例 1: 简单组件绑定 ====================

/**
 * 原始自定义组件 - ColorPicker
 * 注意: 这个组件的 props 命名与 Formily 标准不同
 */
interface ColorPickerProps {
  color?: string // 使用 color 而不是 value
  onColorChange?: (color: string) => void // 使用 onColorChange 而不是 onChange
  disabled?: boolean
  size?: 'small' | 'default' | 'large'
}

const RawColorPicker: React.FC<ColorPickerProps> = ({ color = '#1890ff', onColorChange, disabled, size = 'default' }) => {
  const colors = ['#f5222d', '#fa8c16', '#fadb14', '#52c41a', '#1890ff', '#722ed1', '#eb2f96']

  const sizeMap = {
    small: 24,
    default: 32,
    large: 40,
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {colors.map((c) => (
        <div
          key={c}
          onClick={() => !disabled && onColorChange?.(c)}
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            backgroundColor: c,
            border: c === color ? '3px solid #000' : '1px solid #d9d9d9',
            borderRadius: 4,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      ))}
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          backgroundColor: color,
          border: '2px solid #000',
          borderRadius: 4,
        }}
      />
    </div>
  )
}

/**
 * 阅读态组件 - ColorPreview
 */
const ColorPreview: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 20,
          height: 20,
          backgroundColor: value,
          border: '1px solid #d9d9d9',
          borderRadius: 4,
        }}
      />
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

/**
 * 绑定步骤:
 * 1. 使用 connect 包装原始组件
 * 2. 使用 mapProps 映射属性名
 * 3. 使用 mapReadPretty 指定阅读态组件
 */
const ColorPicker = connect(
  RawColorPicker,
  // mapProps: 将 Formily 字段属性映射为组件 props
  mapProps((props, field) => {
    return {
      ...props,
      color: field.value, // field.value → color
      onColorChange: field.onInput, // field.onInput → onColorChange
      disabled: !field.editable, // field.editable → disabled
    }
  }),
  // mapReadPretty: 指定阅读态组件
  mapReadPretty(ColorPreview)
)

// ==================== 示例 2: 复杂组件绑定 ====================

/**
 * 原始自定义组件 - RangeInput
 * 一个同时包含 min 和 max 值的范围输入组件
 */
interface RangeInputProps {
  range?: { min: number; max: number } // 使用 range 对象
  onRangeChange?: (range: { min: number; max: number }) => void
  disabled?: boolean
  step?: number
}

const RawRangeInput: React.FC<RangeInputProps> = ({ range = { min: 0, max: 100 }, onRangeChange, disabled, step = 1 }) => {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div>
        <span style={{ marginRight: 8 }}>最小值:</span>
        <Slider
          style={{ width: 200, display: 'inline-block' }}
          min={0}
          max={range.max - step}
          step={step}
          value={range.min}
          onChange={(min) => onRangeChange?.({ ...range, min })}
          disabled={disabled}
        />
        <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{range.min}</span>
      </div>
      <div>
        <span style={{ marginRight: 8 }}>最大值:</span>
        <Slider
          style={{ width: 200, display: 'inline-block' }}
          min={range.min + step}
          max={200}
          step={step}
          value={range.max}
          onChange={(max) => onRangeChange?.({ ...range, max })}
          disabled={disabled}
        />
        <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{range.max}</span>
      </div>
    </div>
  )
}

/**
 * 阅读态组件
 */
const RangePreview: React.FC<{ value: { min: number; max: number } }> = ({ value }) => {
  if (!value) return <span>-</span>
  return (
    <Tag color="blue">
      {value.min} ~ {value.max}
    </Tag>
  )
}

/**
 * 绑定 RangeInput
 */
const RangeInput = connect(
  RawRangeInput,
  mapProps((props, field) => ({
    ...props,
    range: field.value,
    onRangeChange: field.onInput,
    disabled: !field.editable,
  })),
  mapReadPretty(RangePreview)
)

// ==================== 示例 3: 绑定 Ant Design 组件 ====================

/**
 * 演示如何绑定 Ant Design 的 Rate 组件
 * Rate 组件本身不需要映射,但可以添加自定义逻辑
 */

// 自定义阅读态
const RatePreview: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Rate disabled value={value} />
      <span style={{ color: '#999' }}>({value} 分)</span>
    </div>
  )
}

// 绑定 Rate
const Rating = connect(
  Rate,
  // 可以添加额外的映射逻辑
  mapProps((props, field) => ({
    ...props,
    value: field.value,
    onChange: field.onInput,
    disabled: !field.editable,
    // 自定义: 添加 tooltip
    tooltips: ['terrible', 'bad', 'normal', 'good', 'wonderful'],
  })),
  mapReadPretty(RatePreview)
)

// ==================== 创建 SchemaField ====================

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Input,
    Switch,
    Space: FormilySpace,
    // 注册自定义组件
    ColorPicker,
    RangeInput,
    Rating,
  },
})

// ==================== Schema 定义 ====================

const schema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        labelCol: 6,
        wrapperCol: 16,
      },
      properties: {
        // ========== 示例 1: ColorPicker ==========
        section1: {
          type: 'void',
          'x-component': 'h3',
          'x-component-props': {
            children: '示例 1: 自定义颜色选择器',
          },
        },

        themeColor: {
          type: 'string',
          title: '主题颜色',
          default: '#1890ff',
          'x-decorator': 'FormItem',
          'x-component': 'ColorPicker',
          'x-component-props': {
            size: 'default',
          },
        },

        divider1: {
          type: 'void',
          'x-component': 'Divider',
        },

        // ========== 示例 2: RangeInput ==========
        section2: {
          type: 'void',
          'x-component': 'h3',
          'x-component-props': {
            children: '示例 2: 范围输入组件',
          },
        },

        priceRange: {
          type: 'object',
          title: '价格区间',
          default: { min: 20, max: 80 },
          'x-decorator': 'FormItem',
          'x-component': 'RangeInput',
          'x-component-props': {
            step: 5,
          },
        },

        divider2: {
          type: 'void',
          'x-component': 'Divider',
        },

        // ========== 示例 3: Rating ==========
        section3: {
          type: 'void',
          'x-component': 'h3',
          'x-component-props': {
            children: '示例 3: 绑定 Ant Design 组件',
          },
        },

        satisfaction: {
          type: 'number',
          title: '满意度',
          default: 4,
          'x-decorator': 'FormItem',
          'x-component': 'Rating',
        },

        // 根据满意度显示反馈
        feedback: {
          type: 'string',
          title: '反馈信息',
          'x-decorator': 'FormItem',
          'x-component': 'Input.TextArea',
          'x-component-props': {
            placeholder: '请输入您的反馈...',
            rows: 3,
          },
          'x-reactions': {
            dependencies: ['.satisfaction'],
            fulfill: {
              state: {
                visible: '{{$deps[0] <= 3}}', // 满意度 <=3 时显示
                required: '{{$deps[0] <= 3}}',
              },
            },
          },
        },

        divider3: {
          type: 'void',
          'x-component': 'Divider',
        },

        // ========== 阅读态切换 ==========
        section4: {
          type: 'void',
          'x-component': 'h3',
          'x-component-props': {
            children: '阅读态切换',
          },
        },

        readPretty: {
          type: 'boolean',
          title: '阅读态模式',
          default: false,
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          'x-component-props': {
            checkedChildren: '开',
            unCheckedChildren: '关',
          },
        },
      },
    },
  },
}

// ==================== 源码展示 ====================

const sourceCode = {
  colorPicker: `// 1. 定义原始组件
const RawColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onColorChange,
  disabled
}) => {
  // ... 组件实现
}

// 2. 定义阅读态组件
const ColorPreview: React.FC<{ value: string }> = ({ value }) => {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{
        width: 20,
        height: 20,
        backgroundColor: value
      }} />
      <span>{value}</span>
    </div>
  )
}

// 3. 绑定到 Formily
const ColorPicker = connect(
  RawColorPicker,
  mapProps((props, field) => ({
    color: field.value,           // value → color
    onColorChange: field.onInput, // onChange → onColorChange
    disabled: !field.editable,
  })),
  mapReadPretty(ColorPreview)
)`,

  rangeInput: `// 复杂对象值的绑定
const RangeInput = connect(
  RawRangeInput,
  mapProps((props, field) => ({
    range: field.value,              // 整个对象作为 value
    onRangeChange: field.onInput,    // 更新整个对象
    disabled: !field.editable,
  })),
  mapReadPretty(RangePreview)
)`,

  rating: `// 绑定第三方库组件
const Rating = connect(
  Rate,  // Ant Design Rate 组件
  mapProps((props, field) => ({
    value: field.value,
    onChange: field.onInput,
    disabled: !field.editable,
    tooltips: ['terrible', 'bad', 'normal', 'good', 'wonderful'],
  })),
  mapReadPretty(RatePreview)
)`,
}

// ==================== 主组件 ====================

const ReactBindingDemo: React.FC = () => {
  const [form] = useState(() =>
    createForm({
      effects() {
        // 监听阅读态切换
        import('@formily/core').then(({ onFieldValueChange }) => {
          onFieldValueChange('readPretty', (field) => {
            const readPretty = field.value
            // 设置所有字段的阅读态
            form.setPattern(readPretty ? 'readPretty' : 'editable')
          })
        })
      },
    })
  )

  const [activeCode, setActiveCode] = useState<'colorPicker' | 'rangeInput' | 'rating'>('colorPicker')

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">12. React 组件库绑定</h2>
      <p className="demo-card-description">深入演示如何使用 connect、mapProps、mapReadPretty 绑定任意组件到 Formily</p>

      <Alert
        message="组件绑定核心步骤"
        description={
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>connect(Component)</strong>: 将组件连接到 Formily 响应式系统
            </li>
            <li>
              <strong>mapProps</strong>: 映射字段属性到组件 props (如 value → color)
            </li>
            <li>
              <strong>mapReadPretty</strong>: 指定阅读态使用的组件
            </li>
            <li>
              <strong>createSchemaField</strong>: 注册绑定后的组件
            </li>
          </ol>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 左侧: 表单 */}
        <Card title="表单演示" size="small">
          <FormProvider form={form}>
            <SchemaField schema={schema} />
          </FormProvider>

          <Divider />

          <Space>
            <Button
              type="primary"
              onClick={() => {
                form.submit((values) => {
                  console.log('表单值:', values)
                  alert('提交成功!查看控制台')
                })
              }}
            >
              提交表单
            </Button>
            <Button onClick={() => form.reset()}>重置</Button>
            <Button
              onClick={() => {
                console.log('当前表单值:', form.values)
              }}
            >
              打印值
            </Button>
          </Space>
        </Card>

        {/* 右侧: 源码展示 */}
        <Card
          title="绑定源码"
          size="small"
          extra={
            <Space>
              <Button size="small" type={activeCode === 'colorPicker' ? 'primary' : 'default'} onClick={() => setActiveCode('colorPicker')}>
                ColorPicker
              </Button>
              <Button size="small" type={activeCode === 'rangeInput' ? 'primary' : 'default'} onClick={() => setActiveCode('rangeInput')}>
                RangeInput
              </Button>
              <Button size="small" type={activeCode === 'rating' ? 'primary' : 'default'} onClick={() => setActiveCode('rating')}>
                Rating
              </Button>
            </Space>
          }
        >
          <pre
            style={{
              backgroundColor: '#f6f8fa',
              padding: 16,
              borderRadius: 6,
              overflow: 'auto',
              maxHeight: 500,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            <code>{sourceCode[activeCode]}</code>
          </pre>
        </Card>
      </div>

      {/* 底部说明 */}
      <Card title="绑定要点说明" size="small" style={{ marginTop: 24 }}>
        <div style={{ lineHeight: 1.8 }}>
          <h4>1. connect 高阶组件</h4>
          <p>
            将普通 React 组件包装成响应式组件,使其能够自动订阅字段状态变化。包装后的组件可以通过 <code>useField()</code> 访问字段实例。
          </p>

          <h4 style={{ marginTop: 16 }}>2. mapProps 属性映射</h4>
          <p>解决组件 props 与 Formily 字段属性命名不一致的问题:</p>
          <ul>
            <li>
              <code>color: field.value</code> - 将字段值映射为 color prop
            </li>
            <li>
              <code>onColorChange: field.onInput</code> - 将字段输入处理器映射为 onColorChange
            </li>
            <li>
              <code>disabled: !field.editable</code> - 根据字段可编辑状态设置 disabled
            </li>
          </ul>

          <h4 style={{ marginTop: 16 }}>3. mapReadPretty 阅读态</h4>
          <p>
            当字段处于 <code>readPretty</code> 模式时,使用指定的阅读态组件替换原组件。通常阅读态组件只展示数据,不提供交互。
          </p>

          <h4 style={{ marginTop: 16 }}>4. 复杂值类型处理</h4>
          <p>
            对于复杂对象值(如 RangeInput 的 <code>{`{min, max}`}</code>),可以直接将整个对象作为 value 传递,onChange 时也更新整个对象。
          </p>

          <h4 style={{ marginTop: 16 }}>5. 绑定第三方组件</h4>
          <p>
            可以绑定任意第三方组件库(Ant Design, Material-UI, Element-UI 等),只需通过 mapProps 适配属性即可,无需修改组件源码。
          </p>
        </div>
      </Card>
    </div>
  )
}

export default ReactBindingDemo
