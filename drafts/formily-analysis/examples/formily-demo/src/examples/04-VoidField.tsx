import React from 'react'
import { createForm } from '@formily/core'
import { FormProvider, FormConsumer, createSchemaField } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  DatePicker,
  NumberPicker,
  FormTab,
  FormCollapse,
  FormStep,
} from '@formily/antd'
import { Card, Button, Space, Form } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * VoidField 虚拟字段示例（JSON Schema 模式）
 *
 * 本示例展示：
 * 1. 使用 JSON Schema 定义布局组件
 * 2. FormTab - 选项卡布局容器
 * 3. FormCollapse - 折叠面板布局容器
 * 4. FormStep - 分步表单容器
 * 5. 虚拟字段的应用场景
 *
 * 重要说明：
 * - 这些组件类型为 'void'，不会在表单数据中生成对应的值
 * - 主要用于布局和UI组织，内部的 Field 仍然会正常提交数据
 */

// 创建 SchemaField 组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    DatePicker,
    NumberPicker,
    FormTab,
    FormCollapse,
    FormStep,
    Space,
  },
})

// ========== Schema 示例 1: FormTab 选项卡布局 ==========
const formTabSchema: ISchema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'void',
      'x-component': 'FormTab',
      properties: {
        tab1: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '个人信息',
          },
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入姓名',
              },
            },
            age: {
              type: 'number',
              title: '年龄',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '请输入年龄',
                min: 1,
                max: 150,
              },
            },
            gender: {
              type: 'string',
              title: '性别',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                placeholder: '请选择性别',
              },
              enum: [
                { label: '男', value: 'male' },
                { label: '女', value: 'female' },
              ],
            },
          },
        },
        tab2: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '联系方式',
          },
          properties: {
            phone: {
              type: 'string',
              title: '手机号',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入手机号',
              },
              'x-validator': [
                {
                  pattern: '^1[3-9]\\d{9}$',
                  message: '请输入有效的手机号',
                },
              ],
            },
            email: {
              type: 'string',
              title: '邮箱',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入邮箱',
              },
              'x-validator': [
                {
                  pattern: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$',
                  message: '请输入有效的邮箱地址',
                },
              ],
            },
          },
        },
        tab3: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '教育经历',
          },
          properties: {
            school: {
              type: 'string',
              title: '学校',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入学校名称',
              },
            },
            major: {
              type: 'string',
              title: '专业',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入专业',
              },
            },
            graduation: {
              type: 'string',
              title: '毕业时间',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'DatePicker',
              'x-component-props': {
                placeholder: '请选择毕业时间',
                style: { width: '100%' },
              },
            },
          },
        },
      },
    },
  },
}

// ========== Schema 示例 2: FormCollapse 折叠面板布局 ==========
const formCollapseSchema: ISchema = {
  type: 'object',
  properties: {
    collapse: {
      type: 'void',
      'x-component': 'FormCollapse',
      'x-component-props': {
        defaultActiveKey: ['panel1', 'panel2'],
      },
      properties: {
        panel1: {
          type: 'void',
          'x-component': 'FormCollapse.CollapsePanel',
          'x-component-props': {
            header: '个人信息',
            key: 'panel1',
          },
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入姓名',
              },
            },
            age: {
              type: 'number',
              title: '年龄',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '请输入年龄',
                min: 1,
                max: 150,
              },
            },
          },
        },
        panel2: {
          type: 'void',
          'x-component': 'FormCollapse.CollapsePanel',
          'x-component-props': {
            header: '工作经验',
            key: 'panel2',
          },
          properties: {
            company: {
              type: 'string',
              title: '公司',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入公司名称',
              },
            },
            position: {
              type: 'string',
              title: '职位',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入职位',
              },
            },
            startDate: {
              type: 'string',
              title: '入职时间',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'DatePicker',
              'x-component-props': {
                placeholder: '请选择入职时间',
                style: { width: '100%' },
              },
            },
          },
        },
      },
    },
  },
}

// ========== Schema 示例 3: FormStep 分步表单 ==========
const formStepSchema: ISchema = {
  type: 'object',
  properties: {
    step: {
      type: 'void',
      'x-component': 'FormStep',
      'x-component-props': {
        formStep: '{{formStep}}',
      },
      properties: {
        step1: {
          type: 'void',
          'x-component': 'FormStep.StepPane',
          'x-component-props': {
            title: '第一步',
          },
          properties: {
            name: {
              type: 'string',
              title: '姓名',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入姓名',
              },
            },
            age: {
              type: 'number',
              title: '年龄',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'NumberPicker',
              'x-component-props': {
                placeholder: '请输入年龄',
                min: 1,
                max: 150,
              },
            },
          },
        },
        step2: {
          type: 'void',
          'x-component': 'FormStep.StepPane',
          'x-component-props': {
            title: '第二步',
          },
          properties: {
            phone: {
              type: 'string',
              title: '手机号',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入手机号',
              },
              'x-validator': [
                {
                  pattern: '^1[3-9]\\d{9}$',
                  message: '请输入有效的手机号',
                },
              ],
            },
            email: {
              type: 'string',
              title: '邮箱',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入邮箱',
              },
              'x-validator': [
                {
                  pattern: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$',
                  message: '请输入有效的邮箱地址',
                },
              ],
            },
          },
        },
        step3: {
          type: 'void',
          'x-component': 'FormStep.StepPane',
          'x-component-props': {
            title: '第三步',
          },
          properties: {
            company: {
              type: 'string',
              title: '公司',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入公司名称',
              },
            },
            position: {
              type: 'string',
              title: '职位',
              required: true,
              'x-decorator': 'FormItem',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: '请输入职位',
              },
            },
          },
        },
      },
    },
  },
}

// 创建表单实例
const tabForm = createForm()
const collapseForm = createForm()
const stepForm = createForm()
const formStep = FormStep.createFormStep()

const VoidFieldDemo: React.FC = () => {
  const handleSubmit = (form: any, name: string) => {
    form.submit((values: any) => {
      console.log(`${name} 表单值:`, values)
      alert(`${name} 提交成功！注意：FormTab/FormCollapse 等布局组件不会出现在提交数据中`)
    })
  }

  console.log({ formStep });
  return (
    <div className="demo-card">
      <h2 className="demo-card-title">04. 布局组件（虚拟字段）（JSON Schema 模式）</h2>
      <p className="demo-card-description">
        展示如何使用 JSON Schema 定义 FormTab、FormCollapse、FormStep 等布局组件。
        这些组件不参与数据提交，仅用于组织表单UI。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ========== FormTab 示例 ========== */}
        <Card title="FormTab - 选项卡布局" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 FormTab 创建选项卡式表单布局
          </p>

          <FormProvider form={tabForm}>
            <SchemaField schema={formTabSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button type="primary" onClick={() => handleSubmit(tabForm, 'FormTab')}>
                  提交
                </Button>
                <Button onClick={() => tabForm.reset()}>重置</Button>
              </Space>
            </div>

            <FormConsumer>
              {() => (
                <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                  <div className="json-preview">
                    <pre>{JSON.stringify(tabForm.values, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>

        {/* ========== FormCollapse 示例 ========== */}
        <Card title="FormCollapse - 折叠面板布局" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 FormCollapse 创建折叠面板式表单布局
          </p>

          <FormProvider form={collapseForm}>
            <SchemaField schema={formCollapseSchema} />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button type="primary" onClick={() => handleSubmit(collapseForm, 'FormCollapse')}>
                  提交
                </Button>
                <Button onClick={() => collapseForm.reset()}>重置</Button>
              </Space>
            </div>
            <FormConsumer>
              {() => (
                <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                  <div className="json-preview">
                    <pre>{JSON.stringify(collapseForm.values, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>

        {/* ========== FormStep 示例 ========== */}
        <Card title="FormStep - 分步表单" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 FormStep 创建分步表单
          </p>

          <FormProvider form={stepForm}>
            <SchemaField schema={formStepSchema} scope={{ formStep }} />
            <FormConsumer>
              {() => (
                <>
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Button
                        disabled={!formStep.allowBack}
                        onClick={() => {
                          // setCurrent(current - 1)
                          formStep.back();
                        }}
                      >
                        上一步
                      </Button>
                      <Button
                        disabled={!formStep.allowNext}
                        onClick={() => {
                          // setCurrent(current + 1)
                          formStep.next();
                        }}
                      >
                        下一步
                      </Button>
                      <Button type="primary" onClick={() => {
                        formStep.submit(console.log);
                      }}>
                        提交
                      </Button>
                      <Button onClick={() => stepForm.reset()}>重置</Button>
                    </Space>
                  </div>

                  <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                    <div className="json-preview">
                      <pre>{JSON.stringify(stepForm.values, null, 2)}</pre>
                    </div>
                  </Card>
                </>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>
      </div>
    </div>
  )
}

export default VoidFieldDemo
