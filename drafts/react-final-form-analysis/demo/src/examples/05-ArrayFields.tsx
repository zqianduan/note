/**
 * 示例 5: 数组字段（FieldArray）
 *
 * 展示：
 * - 动态添加/删除字段
 * - 数组字段的验证
 * - 拖拽排序（可选）
 */

import React from 'react'
import { Form, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'
import { Input, Button, Card, Space, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

interface Friend {
  firstName: string
  lastName: string
}

interface FormValues {
  friends: Friend[]
}

const required = (value: any) => (value ? undefined : '必填')

const ArrayFields: React.FC = () => {
  const onSubmit = (values: FormValues) => {
    console.log('Form values:', values)
    message.success('提交成功！')
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">数组字段示例</h2>
      <p className="demo-card-description">
        动态添加/删除表单字段，适用于多条目数据录入场景
      </p>

      <Form<FormValues>
        onSubmit={onSubmit}
        mutators={{
          ...arrayMutators,
        }}
        initialValues={{
          friends: [{ firstName: '', lastName: '' }],
        }}
      >
        {({ handleSubmit, form, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit}>
            <Card title="好友列表">
              <FieldArray name="friends">
                {({ fields }) => (
                  <div>
                    {fields.map((name, index) => (
                      <Card
                        key={name}
                        size="small"
                        title={`好友 #${index + 1}`}
                        extra={
                          fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => fields.remove(index)}
                            >
                              删除
                            </Button>
                          )
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Field
                            name={`${name}.firstName`}
                            validate={required}
                            subscription={{ value: true, error: true, touched: true }}
                          >
                            {({ input, meta }) => (
                              <div>
                                <label>
                                  名 <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input
                                  {...input}
                                  placeholder="请输入名"
                                  status={meta.error && meta.touched ? 'error' : ''}
                                />
                                {meta.error && meta.touched && (
                                  <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                                    {meta.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </Field>

                          <Field
                            name={`${name}.lastName`}
                            validate={required}
                            subscription={{ value: true, error: true, touched: true }}
                          >
                            {({ input, meta }) => (
                              <div>
                                <label>
                                  姓 <span style={{ color: 'red' }}>*</span>
                                </label>
                                <Input
                                  {...input}
                                  placeholder="请输入姓"
                                  status={meta.error && meta.touched ? 'error' : ''}
                                />
                                {meta.error && meta.touched && (
                                  <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                                    {meta.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </Field>
                        </Space>
                      </Card>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => fields.push({ firstName: '', lastName: '' })}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加好友
                    </Button>
                  </div>
                )}
              </FieldArray>

              <div style={{ marginTop: 24 }}>
                <Space>
                  <Button type="primary" htmlType="submit" disabled={submitting || pristine}>
                    提交
                  </Button>
                  <Button
                    htmlType="button"
                    onClick={() => form.reset()}
                    disabled={submitting || pristine}
                  >
                    重置
                  </Button>
                </Space>
              </div>
            </Card>

            {/* 表单值预览 */}
            <Card style={{ marginTop: 16 }} title="表单值预览">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(values, null, 2)}
              </pre>
            </Card>
          </form>
        )}
      </Form>

      {/* 代码示例 */}
      <Card style={{ marginTop: 16 }} title="💻 实现代码">
        <pre className="code-block">{`import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'

<Form
  onSubmit={onSubmit}
  mutators={{
    ...arrayMutators, // 必须添加 array mutators
  }}
  initialValues={{
    friends: [{ firstName: '', lastName: '' }]
  }}
>
  {({ handleSubmit, form }) => (
    <form onSubmit={handleSubmit}>
      <FieldArray name="friends">
        {({ fields }) => (
          <div>
            {fields.map((name, index) => (
              <div key={name}>
                <Field name={\`\${name}.firstName\`}>
                  {({ input }) => <Input {...input} />}
                </Field>
                <Field name={\`\${name}.lastName\`}>
                  {({ input }) => <Input {...input} />}
                </Field>
                <button onClick={() => fields.remove(index)}>
                  删除
                </button>
              </div>
            ))}
            <button onClick={() => fields.push({})}>
              添加
            </button>
          </div>
        )}
      </FieldArray>
    </form>
  )}
</Form>`}</pre>
      </Card>

      {/* 最佳实践 */}
      <Card style={{ marginTop: 16 }} title="💡 最佳实践">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>1. 使用 key 属性</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              使用 FieldArray 提供的 name 作为 key，而不是 index，避免重新渲染问题
            </p>
          </div>

          <div>
            <strong>2. 添加 array mutators</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              必须在 Form 组件的 mutators 属性中添加 arrayMutators
            </p>
          </div>

          <div>
            <strong>3. 字段命名规范</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              使用模板字符串命名数组字段：`${'{'}name{'}'}.fieldName`
            </p>
          </div>

          <div>
            <strong>4. 验证数组字段</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              可以对数组字段的每个子字段单独添加验证规则
            </p>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default ArrayFields
