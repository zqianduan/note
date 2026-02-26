import React from 'react'
import { createForm } from '@formily/core'
import { FormProvider, FormConsumer, createSchemaField } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  ArrayItems,
  ArrayTable,
  ArrayCollapse,
  Space,
} from '@formily/antd'
import { Card, Button } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * ArrayField 数组字段示例（JSON Schema 模式）
 *
 * 本示例展示：
 * 1. 使用 JSON Schema 定义数组字段
 * 2. ArrayItems - 列表型数组组件（Schema 场景）
 * 3. ArrayTable - 表格型数组组件
 * 4. ArrayCollapse - 折叠面板型数组组件
 * 5. 数组字段的增删改查操作
 *
 * 重要说明：
 * - 使用 JSON Schema 定义表单结构，便于配置化和动态生成
 * - ArrayItems/ArrayTable/ArrayCollapse 在 Schema 场景下的标准用法
 */

// 创建 SchemaField 组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    ArrayItems,
    ArrayTable,
    ArrayCollapse,
    Space,
    Card,
  },
})

// ========== Schema 示例 1: ArrayItems 列表型数组 ==========
const arrayItemsSchema: ISchema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: '标签列表',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      'x-component-props': {
        style: { width: '100%' },
      },
      items: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入标签',
          style: { width: 300 },
        },
        'x-validator': [
          {
            validator: '{{(value) => {if (!value || value.trim() === "") return "标签不能为空"; return ""}}}',
          },
        ],
      },
      properties: {
        addition: {
          type: 'void',
          title: '添加标签',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
  },
}

// ========== Schema 示例 2: ArrayTable 表格型数组 ==========
const arrayTableSchema: ISchema = {
  type: 'object',
  properties: {
    contacts: {
      type: 'array',
      title: '联系人列表',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayTable',
      'x-component-props': {
        pagination: false,
      },
      items: {
        type: 'object',
        properties: {
          column1: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '序号',
              width: 80,
              align: 'center',
            },
            properties: {
              index: {
                type: 'void',
                'x-component': 'ArrayTable.Index',
              },
            },
          },
          column2: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '姓名',
              dataIndex: 'name',
              width: 200,
            },
            properties: {
              name: {
                type: 'string',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入姓名',
                },
              },
            },
          },
          column3: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '电话',
              dataIndex: 'phone',
              width: 200,
            },
            properties: {
              phone: {
                type: 'string',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入电话',
                },
                'x-validator': [
                  {
                    pattern: '^1[3-9]\\d{9}$',
                    message: '请输入有效的手机号',
                  },
                ],
              },
            },
          },
          column4: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '邮箱',
              dataIndex: 'email',
            },
            properties: {
              email: {
                type: 'string',
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
          column5: {
            type: 'void',
            'x-component': 'ArrayTable.Column',
            'x-component-props': {
              title: '操作',
              width: 150,
              align: 'center',
            },
            properties: {
              operations: {
                type: 'void',
                'x-component': 'Space',
                properties: {
                  moveUp: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveUp',
                  },
                  moveDown: {
                    type: 'void',
                    'x-component': 'ArrayTable.MoveDown',
                  },
                  remove: {
                    type: 'void',
                    'x-component': 'ArrayTable.Remove',
                  },
                },
              },
            },
          },
        },
      },
      properties: {
        addition: {
          type: 'void',
          title: '添加联系人',
          'x-component': 'ArrayTable.Addition',
        },
      },
    },
  },
}

// ========== Schema 示例 3: ArrayCollapse 折叠面板型数组 ==========
const arrayCollapseSchema: ISchema = {
  type: 'object',
  properties: {
    projects: {
      type: 'array',
      title: '项目列表',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayCollapse',
      'x-component-props': {
        accordion: false,
      },
      items: {
        type: 'object',
        'x-component': 'ArrayCollapse.CollapsePanel',
        'x-component-props': {
          header: '项目',
        },
        properties: {
          name: {
            type: 'string',
            title: '项目名称',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-component-props': {
              placeholder: '请输入项目名称',
            },
          },
          description: {
            type: 'string',
            title: '项目描述',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              placeholder: '请输入项目描述',
              rows: 3,
            },
          },
          tasks: {
            type: 'array',
            title: '任务列表',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayTable',
            'x-component-props': {
              size: 'small',
              pagination: false,
            },
            items: {
              type: 'object',
              properties: {
                column1: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: '任务标题',
                    dataIndex: 'title',
                  },
                  properties: {
                    title: {
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-component-props': {
                        placeholder: '请输入任务标题',
                      },
                    },
                  },
                },
                column2: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: '状态',
                    dataIndex: 'status',
                    width: 150,
                  },
                  properties: {
                    status: {
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: '请选择状态',
                      },
                      enum: [
                        { label: '未开始', value: 'todo' },
                        { label: '进行中', value: 'processing' },
                        { label: '已完成', value: 'done' },
                      ],
                    },
                  },
                },
                column3: {
                  type: 'void',
                  'x-component': 'ArrayTable.Column',
                  'x-component-props': {
                    title: '操作',
                    width: 100,
                    align: 'center',
                  },
                  properties: {
                    remove: {
                      type: 'void',
                      'x-component': 'ArrayTable.Remove',
                    },
                  },
                },
              },
            },
            properties: {
              addition: {
                type: 'void',
                title: '添加任务',
                'x-component': 'ArrayTable.Addition',
              },
            },
          },
          operations: {
            type: 'void',
            'x-component': 'Space',
            properties: {
              remove: {
                type: 'void',
                title: '删除',
                'x-component': 'ArrayCollapse.Remove',
              },
              moveUp: {
                type: 'void',
                title: '上移',
                'x-component': 'ArrayCollapse.MoveUp',
              },
              moveDown: {
                type: 'void',
                title: '下移',
                'x-component': 'ArrayCollapse.MoveDown',
              },
            },
          },
        },
      },
      properties: {
        addition: {
          type: 'void',
          title: '添加项目',
          'x-component': 'ArrayCollapse.Addition',
        },
      },
    },
  },
}

// 创建表单实例
const arrayItemsForm = createForm({
  initialValues: {
    tags: ['React', 'Vue'],
  },
})

const arrayTableForm = createForm({
  initialValues: {
    contacts: [
      { name: '张三', phone: '13800138000', email: 'zhangsan@example.com' },
      { name: '李四', phone: '13900139000', email: 'lisi@example.com' },
    ],
  },
})

const arrayCollapseForm = createForm({
  initialValues: {
    projects: [
      {
        name: '项目A',
        description: '这是项目A的描述',
        tasks: [
          { title: '任务1', status: 'done' },
          { title: '任务2', status: 'processing' },
        ],
      },
    ],
  },
})

const ArrayFieldDemo: React.FC = () => {
  const handleSubmit = (form: any, name: string) => {
    form.submit((values: any) => {
      console.log(`${name} 表单值:`, values)
      alert(`${name} 提交成功！查看控制台获取数据`)
    })
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">02. ArrayField 数组字段（JSON Schema 模式）</h2>
      <p className="demo-card-description">
        展示如何使用 JSON Schema 定义数组字段，包括 ArrayItems（列表）、ArrayTable（表格）、
        ArrayCollapse（折叠面板）三种展示形式，以及数组的增删改查操作。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ========== ArrayItems 示例 ========== */}
        <Card title="ArrayItems - 列表型数组（Schema 场景）" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 ArrayItems，适用于简单的列表数据
          </p>

          <FormProvider form={arrayItemsForm}>
            <SchemaField schema={arrayItemsSchema} />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => handleSubmit(arrayItemsForm, 'ArrayItems')}>
                提交
              </Button>
            </div>

            <FormConsumer>
              {() => (
                <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                  <div className="json-preview">
                    <pre>{JSON.stringify(arrayItemsForm.values, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>

        {/* ========== ArrayTable 示例 ========== */}
        <Card title="ArrayTable - 表格型数组" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 ArrayTable，适用于结构化的对象数组
          </p>

          <FormProvider form={arrayTableForm}>
            <SchemaField schema={arrayTableSchema} />
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => handleSubmit(arrayTableForm, 'ArrayTable')}>
                提交
              </Button>
            </div>

            <FormConsumer>
              {() => (
                <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                  <div className="json-preview">
                    <pre>{JSON.stringify(arrayTableForm.values, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>

        {/* ========== ArrayCollapse 示例 ========== */}
        <Card title="ArrayCollapse - 折叠面板型数组" type="inner">
          <p style={{ color: '#666', marginBottom: 16 }}>
            使用 JSON Schema 定义 ArrayCollapse，适用于复杂的嵌套数据结构
          </p>

          <FormProvider form={arrayCollapseForm}>
            <SchemaField schema={arrayCollapseSchema} />
            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                onClick={() => handleSubmit(arrayCollapseForm, 'ArrayCollapse')}
              >
                提交
              </Button>
            </div>

            <FormConsumer>
              {() => (
                <Card title="表单状态" size="small" style={{ marginTop: 16 }}>
                  <div className="json-preview">
                    <pre>{JSON.stringify(arrayCollapseForm.values, null, 2)}</pre>
                  </div>
                </Card>
              )}
            </FormConsumer>
          </FormProvider>
        </Card>
      </div>
    </div>
  )
}

export default ArrayFieldDemo
