import React, { useState } from 'react'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  NumberPicker,
  DatePicker,
  Switch,
  Radio,
} from '@formily/antd'
import { Card, Button, Space, Alert, Timeline, Tag } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * FormEffects 表单副作用示例（JSON Schema 模式）
 *
 * 本示例展示：
 * 1. 使用 x-reactions 实现字段联动
 * 2. 条件显示/隐藏字段
 * 3. 省市联动
 * 4. 价格计算
 * 5. 动态校验
 * 6. 复杂联动逻辑实现
 *
 * x-reactions 是 JSON Schema 中实现副作用的标准方式：
 * - dependencies: 依赖的字段路径
 * - fulfill: 依赖字段变化时执行的状态更新
 * - when: 条件判断
 * - target: 目标字段
 */

// 创建 SchemaField 组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    NumberPicker,
    DatePicker,
    Switch,
    Radio,
    Space,
  },
})

// ========== Schema 示例 1: 条件显示/隐藏字段 ==========
const conditionalSchema: ISchema = {
  type: 'object',
  properties: {
    userType: {
      type: 'string',
      title: '用户类型',
      enum: [
        { label: '个人用户', value: 'personal' },
        { label: '企业用户', value: 'enterprise' },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      'x-component-props': {
        optionType: 'button',
      },
      default: 'personal',
    },
    name: {
      type: 'string',
      title: '姓名',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入姓名',
      },
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'personal'}}",
            required: "{{$deps[0] === 'personal'}}",
          },
        },
      },
    },
    idCard: {
      type: 'string',
      title: '身份证号',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入身份证号',
      },
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'personal'}}",
            required: "{{$deps[0] === 'personal'}}",
          },
        },
      },
      'x-validator': [
        {
          pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
          message: '请输入有效的身份证号',
        },
      ],
    },
    company: {
      type: 'string',
      title: '公司名称',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入公司名称',
      },
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}",
          },
        },
      },
    },
    businessLicense: {
      type: 'string',
      title: '营业执照号',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入营业执照号',
      },
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}",
          },
        },
      },
    },
  },
}

// ========== Schema 示例 2: 省市联动 ==========
const cascadeSchema: ISchema = {
  type: 'object',
  properties: {
    province: {
      type: 'string',
      title: '省份',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请选择省份',
      },
      enum: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
        { label: '浙江', value: 'zhejiang' },
      ],
    },
    city: {
      type: 'string',
      title: '城市',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Select',
      'x-component-props': {
        placeholder: '请先选择省份',
      },
      'x-reactions': {
        dependencies: ['.province'],
        fulfill: {
          state: {
            value: '{{undefined}}',
          },
          schema: {
            'x-component-props': {
              // 根据省份动态设置城市选项
              options: "{{$deps[0] === 'beijing' ? [{label:'北京市',value:'beijing'}] : $deps[0] === 'shanghai' ? [{label:'上海市',value:'shanghai'}] : $deps[0] === 'guangdong' ? [{label:'广州市',value:'guangzhou'},{label:'深圳市',value:'shenzhen'},{label:'东莞市',value:'dongguan'}] : $deps[0] === 'zhejiang' ? [{label:'杭州市',value:'hangzhou'},{label:'宁波市',value:'ningbo'},{label:'温州市',value:'wenzhou'}] : []}}",
            },
          },
        },
      },
    },
  },
}

// ========== Schema 示例 3: 价格计算 ==========
const calculationSchema: ISchema = {
  type: 'object',
  properties: {
    quantity: {
      type: 'number',
      title: '数量',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入数量',
        min: 1,
        style: { width: '100%' },
      },
      default: 1,
    },
    unitPrice: {
      type: 'number',
      title: '单价（元）',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入单价',
        min: 0,
        precision: 2,
        style: { width: '100%' },
      },
      default: 100,
    },
    totalPrice: {
      type: 'number',
      title: '总价（元）',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        disabled: true,
        precision: 2,
        style: { width: '100%' },
      },
      'x-reactions': {
        dependencies: ['.quantity', '.unitPrice'],
        fulfill: {
          state: {
            value: '{{($deps[0] || 0) * ($deps[1] || 0)}}',
          },
        },
      },
    },
    discount: {
      type: 'number',
      title: '折扣',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        placeholder: '请输入折扣（0-1）',
        min: 0,
        max: 1,
        step: 0.1,
        precision: 2,
        style: { width: '100%' },
      },
      default: 1,
    },
    finalPrice: {
      type: 'number',
      title: '最终价格（元）',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
      'x-component-props': {
        disabled: true,
        precision: 2,
        style: { width: '100%' },
      },
      'x-reactions': [
        {
          dependencies: ['.quantity', '.unitPrice', '.discount'],
          fulfill: {
            state: {
              value: '{{($deps[0] || 0) * ($deps[1] || 0) * ($deps[2] || 1)}}',
            },
          },
        },
        {
          dependencies: ['.quantity'],
          fulfill: {
            state: {
              // 数量大于等于10时自动打9折
              value: '{{$deps[0] >= 10 ? $self.value * 0.9 : $self.value}}',
            },
          },
        },
      ],
    },
  },
}

// ========== Schema 示例 4: 动态校验 ==========
const validationSchema: ISchema = {
  type: 'object',
  properties: {
    enableDateRange: {
      type: 'boolean',
      title: '启用日期范围',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      default: false,
    },
    startDate: {
      type: 'string',
      title: '开始日期',
      'x-decorator': 'FormItem',
      'x-component': 'DatePicker',
      'x-component-props': {
        placeholder: '请选择开始日期',
        style: { width: '100%' },
      },
      'x-reactions': {
        dependencies: ['.enableDateRange'],
        fulfill: {
          state: {
            required: '{{$deps[0]}}',
            visible: '{{$deps[0]}}',
          },
        },
      },
    },
    endDate: {
      type: 'string',
      title: '结束日期',
      'x-decorator': 'FormItem',
      'x-component': 'DatePicker',
      'x-component-props': {
        placeholder: '请选择结束日期',
        style: { width: '100%' },
      },
      'x-reactions': {
        dependencies: ['.enableDateRange'],
        fulfill: {
          state: {
            required: '{{$deps[0]}}',
            visible: '{{$deps[0]}}',
          },
        },
      },
    },
  },
}

// 创建表单实例
const conditionalForm = createForm()
const cascadeForm = createForm()
const calculationForm = createForm({ initialValues: { quantity: 1, unitPrice: 100, discount: 1 } })
const validationForm = createForm()

const FormEffectsDemo: React.FC = () => {
  const [effectLogs, setEffectLogs] = useState<string[]>([])

  const addLog = (log: string) => {
    setEffectLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${log}`])
  }

  const handleSubmit = (form: any, name: string) => {
    form.submit((values: any) => {
      console.log(`${name} 表单值:`, values)
      alert(`${name} 提交成功！查看控制台获取数据`)
      addLog(`${name} 提交成功`)
    })
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">06. FormEffects 表单副作用（JSON Schema 模式）</h2>
      <p className="demo-card-description">
        展示如何使用 JSON Schema 的 x-reactions 实现复杂的字段联动、条件显示、数据计算等副作用逻辑。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ========== 示例 1: 条件显示/隐藏 ========== */}
        <Card title="示例 1: 条件显示/隐藏字段" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            根据用户类型动态显示不同的字段，使用 x-reactions 的 dependencies 和 fulfill 实现
          </p>

          <FormProvider form={conditionalForm}>
            <SchemaField schema={conditionalSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSubmit(conditionalForm, '条件显示')}
                >
                  提交
                </Button>
                <Button onClick={() => conditionalForm.reset()}>重置</Button>
              </Space>
            </div>

            <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
              <div className="json-preview">
                <pre>{JSON.stringify(conditionalForm.values, null, 2)}</pre>
              </div>
            </Card>
          </FormProvider>
        </Card>

        {/* ========== 示例 2: 省市联动 ========== */}
        <Card title="示例 2: 省市联动" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            根据省份选择动态加载对应的城市列表，演示级联选择的实现方式
          </p>

          <FormProvider form={cascadeForm}>
            <SchemaField schema={cascadeSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button type="primary" onClick={() => handleSubmit(cascadeForm, '省市联动')}>
                  提交
                </Button>
                <Button onClick={() => cascadeForm.reset()}>重置</Button>
              </Space>
            </div>

            <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
              <div className="json-preview">
                <pre>{JSON.stringify(cascadeForm.values, null, 2)}</pre>
              </div>
            </Card>
          </FormProvider>
        </Card>

        {/* ========== 示例 3: 价格计算 ========== */}
        <Card title="示例 3: 价格计算" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            演示自动计算总价和最终价格，支持数量、单价、折扣的联动计算
          </p>

          <Alert
            message="提示"
            description="数量 >= 10 时自动额外打 9 折"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <FormProvider form={calculationForm}>
            <SchemaField schema={calculationSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSubmit(calculationForm, '价格计算')}
                >
                  提交
                </Button>
                <Button onClick={() => calculationForm.reset()}>重置</Button>
              </Space>
            </div>

            <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
              <div className="json-preview">
                <pre>{JSON.stringify(calculationForm.values, null, 2)}</pre>
              </div>
            </Card>
          </FormProvider>
        </Card>

        {/* ========== 示例 4: 动态校验 ========== */}
        <Card title="示例 4: 动态校验" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            根据开关状态动态控制字段的显示和必填校验
          </p>

          <FormProvider form={validationForm}>
            <SchemaField schema={validationSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSubmit(validationForm, '动态校验')}
                >
                  提交
                </Button>
                <Button onClick={() => validationForm.reset()}>重置</Button>
              </Space>
            </div>

            <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
              <div className="json-preview">
                <pre>{JSON.stringify(validationForm.values, null, 2)}</pre>
              </div>
            </Card>
          </FormProvider>
        </Card>

        {/* ========== 副作用日志 ========== */}
        {effectLogs.length > 0 && (
          <Card title="副作用执行日志" type="inner">
            <Timeline mode="left">
              {effectLogs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  color={index === effectLogs.length - 1 ? 'green' : 'gray'}
                >
                  <span>{log}</span>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>
    </div>
  )
}

export default FormEffectsDemo
