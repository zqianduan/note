/**
 * 示例 4: 条件字段
 *
 * 展示：
 * - 基于其他字段值显示/隐藏字段
 * - 使用 FormSpy 监听字段值变化
 * - 动态表单字段
 */

import React from 'react'
import { Form, Field, FormSpy } from 'react-final-form'
import { Input, Select, Button, Card, Radio, Space } from 'antd'

interface FormValues {
  accountType: 'personal' | 'business'
  name: string
  companyName?: string
  taxId?: string
  contactMethod: 'email' | 'phone'
  email?: string
  phone?: string
}

const ConditionalFields: React.FC = () => {
  const onSubmit = (values: FormValues) => {
    console.log('Form values:', values)
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">条件字段示例</h2>
      <p className="demo-card-description">
        根据用户选择动态显示/隐藏相关字段，优化用户体验
      </p>

      <Form<FormValues>
        onSubmit={onSubmit}
        // subscription={{}}
        initialValues={{
          accountType: 'personal',
          name: '',
          contactMethod: 'email',
        }}
      >
        {({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Card>
              {/* 账户类型选择 */}
              <Field name="accountType">
                {({ input }) => (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      账户类型 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Radio.Group {...input}>
                      <Radio value="personal">个人账户</Radio>
                      <Radio value="business">企业账户</Radio>
                    </Radio.Group>
                  </div>
                )}
              </Field>

              {/* 姓名/公司名 */}
              <Field name="name">
                {({ input }) => (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      {values?.accountType === 'business' ? '联系人' : '姓名'}{' '}
                      <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      placeholder={
                        values?.accountType === 'business'
                          ? '请输入联系人姓名'
                          : '请输入姓名'
                      }
                    />
                  </div>
                )}
              </Field>

              {/* 条件渲染：企业账户特有字段 */}
              <FormSpy subscription={{ values: true }}>
                {({ values }) =>
                  values?.accountType === 'business' && (
                    <>
                      <Field name="companyName">
                        {({ input }) => (
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>
                              公司名称 <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input {...input} placeholder="请输入公司名称" />
                          </div>
                        )}
                      </Field>

                      <Field name="taxId">
                        {({ input }) => (
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>
                              统一社会信用代码 <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input {...input} placeholder="请输入统一社会信用代码" />
                          </div>
                        )}
                      </Field>
                    </>
                  )
                }
              </FormSpy>

              {/* 联系方式选择 */}
              <Field name="contactMethod">
                {({ input }) => (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      首选联系方式 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Select
                      {...input}
                      style={{ width: '100%' }}
                      options={[
                        { label: '电子邮箱', value: 'email' },
                        { label: '手机号码', value: 'phone' },
                      ]}
                    />
                  </div>
                )}
              </Field>

              {/* 条件渲染：根据联系方式显示对应字段 */}
              <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <>
                    {values?.contactMethod === 'email' && (
                      <Field name="email">
                        {({ input }) => (
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>
                              电子邮箱 <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input {...input} type="email" placeholder="请输入电子邮箱" />
                          </div>
                        )}
                      </Field>
                    )}

                    {values?.contactMethod === 'phone' && (
                      <Field name="phone">
                        {({ input }) => (
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>
                              手机号码 <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input {...input} placeholder="请输入手机号码" />
                          </div>
                        )}
                      </Field>
                    )}
                  </>
                )}
              </FormSpy>

              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Card>

            {/* 表单值预览 */}
            <Card style={{ marginTop: 16 }} title="表单值预览">
              <FormSpy subscription={{ values: true }}>
                {({ values }) => (
                  <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                    {JSON.stringify(values, null, 2)}
                  </pre>
                )}
              </FormSpy>
            </Card>
          </form>
        )}
      </Form>

      {/* 代码示例 */}
      <Card style={{ marginTop: 16 }} title="💻 实现代码">
        <pre className="code-block">{`// 使用 FormSpy 监听字段值并条件渲染
<FormSpy subscription={{ values: true }}>
  {({ values }) => (
    values.accountType === 'business' && (
      <>
        <Field name="companyName">
          {({ input }) => <Input {...input} />}
        </Field>
        <Field name="taxId">
          {({ input }) => <Input {...input} />}
        </Field>
      </>
    )
  )}
</FormSpy>

// 或者使用 render props 直接访问 values
<Form onSubmit={onSubmit}>
  {({ handleSubmit, values }) => (
    <form onSubmit={handleSubmit}>
      {values.accountType === 'business' && (
        <Field name="companyName">
          {({ input }) => <Input {...input} />}
        </Field>
      )}
    </form>
  )}
</Form>`}</pre>
      </Card>

      <Card style={{ marginTop: 16 }} title="💡 最佳实践">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>1. 使用 FormSpy 而不是在 Form 中订阅</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              使用 FormSpy 可以将条件渲染逻辑隔离，避免整个表单重渲染
            </p>
          </div>

          <div>
            <strong>2. 只订阅需要的字段</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              如果只需要监听特定字段，使用 Field 的 subscription 属性
            </p>
          </div>

          <div>
            <strong>3. 清理隐藏字段的值</strong>
            <p style={{ color: '#666', margin: '8px 0' }}>
              字段隐藏时，考虑是否需要清除其值（使用 form.change 或 form.mutators）
            </p>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default ConditionalFields
