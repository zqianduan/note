/**
 * 示例 1: 基础表单
 *
 * 展示：
 * - React Final Form 的基本用法
 * - 与 Ant Design 组件的集成
 * - 基础验证
 * - 表单提交处理
 */

import React from 'react'
import { Form, Field } from 'react-final-form'
import { Input, Button, message, Space, Card, Divider } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'

// 表单值类型
interface FormValues {
  username: string
  email: string
  phone: string
}

// 验证函数
const required = (value: any) => (value ? undefined : '此字段为必填项')

const email = (value: string) => {
  if (!value) return undefined
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : '请输入有效的邮箱地址'
}

const phone = (value: string) => {
  if (!value) return undefined
  return /^1[3-9]\d{9}$/.test(value) ? undefined : '请输入有效的手机号码'
}

// 组合验证器
const composeValidators = (...validators: Function[]) => (value: any) =>
  validators.reduce((error, validator) => error || validator(value), undefined)

// 提交处理
const onSubmit = async (values: FormValues) => {
  console.log('Form values:', values)
  message.success('表单提交成功！')
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const BasicForm: React.FC = () => {
  return (
    <div className="demo-card">
      <h2 className="demo-card-title">基础表单示例</h2>
      <p className="demo-card-description">
        展示 React Final Form 的基本用法，包括字段注册、验证和提交处理
      </p>

      <Form<FormValues>
        onSubmit={onSubmit}
        initialValues={{
          username: '',
          email: '',
          phone: '',
        }}
      >
        {({ handleSubmit, submitting, pristine, hasValidationErrors }) => (
          <form onSubmit={handleSubmit}>
            <Card>
              {/* 用户名字段 */}
              <Field name="username" validate={required}>
                {({ input, meta }) => (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      用户名 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      prefix={<UserOutlined />}
                      placeholder="请输入用户名"
                      status={meta.error && meta.touched ? 'error' : ''}
                    />
                    {meta.error && meta.touched && (
                      <div style={{ color: '#ff4d4f', fontSize: 14, marginTop: 4 }}>
                        {meta.error}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              {/* 邮箱字段 */}
              <Field name="email" validate={composeValidators(required, email)}>
                {({ input, meta }) => (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      邮箱 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      prefix={<MailOutlined />}
                      placeholder="请输入邮箱"
                      status={meta.error && meta.touched ? 'error' : ''}
                    />
                    {meta.error && meta.touched && (
                      <div style={{ color: '#ff4d4f', fontSize: 14, marginTop: 4 }}>
                        {meta.error}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              {/* 手机号字段 */}
              <Field name="phone" validate={composeValidators(required, phone)}>
                {({ input, meta }) => (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      手机号 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      prefix={<PhoneOutlined />}
                      placeholder="请输入手机号"
                      status={meta.error && meta.touched ? 'error' : ''}
                    />
                    {meta.error && meta.touched && (
                      <div style={{ color: '#ff4d4f', fontSize: 14, marginTop: 4 }}>
                        {meta.error}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              <Divider />

              {/* 提交按钮 */}
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={pristine || hasValidationErrors}
                >
                  提交
                </Button>
                <Button htmlType="button" disabled={submitting || pristine}>
                  重置
                </Button>
              </Space>
            </Card>
          </form>
        )}
      </Form>

      {/* 说明 */}
      <Card style={{ marginTop: 16 }} title="💡 示例说明">
        <p><strong>核心特性：</strong></p>
        <ul>
          <li>✅ 使用 Field 组件注册字段</li>
          <li>✅ 支持字段级验证</li>
          <li>✅ 自动追踪字段状态（touched, dirty, error 等）</li>
          <li>✅ 集成 Ant Design 组件</li>
          <li>✅ 提交状态管理</li>
        </ul>

        <p style={{ marginTop: 16 }}><strong>验证规则：</strong></p>
        <ul>
          <li>用户名：必填</li>
          <li>邮箱：必填 + 格式验证</li>
          <li>手机号：必填 + 格式验证（1 开头的 11 位数字）</li>
        </ul>
      </Card>
    </div>
  )
}

export default BasicForm
