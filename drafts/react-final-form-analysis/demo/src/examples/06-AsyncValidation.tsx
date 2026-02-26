/**
 * 示例 6: 异步验证
 *
 * 展示：
 * - 异步字段验证（如检查用户名是否存在）
 * - 防抖优化
 * - 验证状态显示
 */

import React from 'react'
import { Form, Field } from 'react-final-form'
import { Input, Button, Card, Spin, message } from 'antd'
import { UserOutlined, LoadingOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

interface FormValues {
  username: string
  email: string
}

// 模拟 API 调用 - 检查用户名是否存在
const checkUsernameExists = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 模拟一些已存在的用户名
  const existingUsernames = ['admin', 'user', 'test', 'demo']
  return existingUsernames.includes(username.toLowerCase())
}

// 模拟 API 调用 - 检查邮箱是否存在
const checkEmailExists = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800))

  const existingEmails = ['test@example.com', 'admin@example.com']
  return existingEmails.includes(email.toLowerCase())
}

// 创建防抖的异步验证函数
const createDebouncedValidator = (
  asyncCheck: (value: string) => Promise<boolean>,
  errorMessage: string,
  delay: number = 500
) => {
  const debouncedCheck = debounce(
    async (value: string, resolve: (error: string | undefined) => void) => {
      try {
        const exists = await asyncCheck(value)
        resolve(exists ? errorMessage : undefined)
      } catch (error) {
        resolve('验证失败，请重试')
      }
    },
    delay
  )

  return async (value: string): Promise<string | undefined> => {
    if (!value) return '此字段为必填项'

    return new Promise(resolve => {
      debouncedCheck(value, resolve)
    })
  }
}

const validateUsername = createDebouncedValidator(
  checkUsernameExists,
  '用户名已存在，请选择其他用户名',
  500
)

const validateEmail = createDebouncedValidator(
  checkEmailExists,
  '该邮箱已被注册',
  500
)

const AsyncValidation: React.FC = () => {
  const onSubmit = async (values: FormValues) => {
    console.log('Form values:', values)
    message.success('注册成功！')
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">异步验证示例</h2>
      <p className="demo-card-description">
        演示如何实现异步字段验证，如检查用户名/邮箱是否已存在
      </p>

      <Card title="用户注册表单">
        <Form<FormValues>
          onSubmit={onSubmit}
          initialValues={{
            username: '',
            email: '',
          }}
        >
          {({ handleSubmit, submitting, pristine, hasValidationErrors }) => (
            <form onSubmit={handleSubmit}>
              {/* 用户名字段 - 异步验证 */}
              <Field
                name="username"
                validate={validateUsername}
                subscription={{ value: true, error: true, touched: true, validating: true }}
              >
                {({ input, meta }) => (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      用户名 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      prefix={<UserOutlined />}
                      suffix={
                        meta.validating ? (
                          <Spin indicator={<LoadingOutlined spin />} size="small" />
                        ) : null
                      }
                      placeholder="请输入用户名"
                      status={meta.error && meta.touched ? 'error' : ''}
                    />
                    {meta.validating && (
                      <div style={{ color: '#1890ff', fontSize: 12, marginTop: 4 }}>
                        正在验证用户名...
                      </div>
                    )}
                    {meta.error && meta.touched && !meta.validating && (
                      <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                        {meta.error}
                      </div>
                    )}
                    {!meta.error && meta.touched && !meta.validating && meta.value && (
                      <div style={{ color: '#52c41a', fontSize: 12, marginTop: 4 }}>
                        ✓ 用户名可用
                      </div>
                    )}
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                      提示：尝试输入 admin, user, test, demo 查看验证效果
                    </div>
                  </div>
                )}
              </Field>

              {/* 邮箱字段 - 异步验证 */}
              <Field
                name="email"
                validate={validateEmail}
                subscription={{ value: true, error: true, touched: true, validating: true }}
              >
                {({ input, meta }) => (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                      邮箱 <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      {...input}
                      type="email"
                      suffix={
                        meta.validating ? (
                          <Spin indicator={<LoadingOutlined spin />} size="small" />
                        ) : null
                      }
                      placeholder="请输入邮箱"
                      status={meta.error && meta.touched ? 'error' : ''}
                    />
                    {meta.validating && (
                      <div style={{ color: '#1890ff', fontSize: 12, marginTop: 4 }}>
                        正在验证邮箱...
                      </div>
                    )}
                    {meta.error && meta.touched && !meta.validating && (
                      <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                        {meta.error}
                      </div>
                    )}
                    {!meta.error && meta.touched && !meta.validating && meta.value && (
                      <div style={{ color: '#52c41a', fontSize: 12, marginTop: 4 }}>
                        ✓ 邮箱可用
                      </div>
                    )}
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                      提示：尝试输入 test@example.com, admin@example.com 查看验证效果
                    </div>
                  </div>
                )}
              </Field>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={pristine || hasValidationErrors}
                size="large"
                block
              >
                注册
              </Button>
            </form>
          )}
        </Form>
      </Card>

      {/* 代码示例 */}
      <Card style={{ marginTop: 16 }} title="💻 实现代码">
        <h4>1. 创建防抖的异步验证器</h4>
        <pre className="code-block">{`import { debounce } from 'lodash'

// API 调用
const checkUsernameExists = async (username: string) => {
  const response = await fetch(\`/api/check-username?username=\${username}\`)
  const data = await response.json()
  return data.exists
}

// 创建防抖验证器
const createDebouncedValidator = (
  asyncCheck: (value: string) => Promise<boolean>,
  errorMessage: string,
  delay: number = 500
) => {
  const debouncedCheck = debounce(
    async (value: string, resolve) => {
      const exists = await asyncCheck(value)
      resolve(exists ? errorMessage : undefined)
    },
    delay
  )

  return async (value: string) => {
    if (!value) return '必填'
    return new Promise(resolve => {
      debouncedCheck(value, resolve)
    })
  }
}

const validateUsername = createDebouncedValidator(
  checkUsernameExists,
  '用户名已存在',
  500
)`}</pre>

        <h4 style={{ marginTop: 16 }}>2. 使用异步验证器</h4>
        <pre className="code-block">{`<Field
  name="username"
  validate={validateUsername}
  subscription={{
    value: true,
    error: true,
    touched: true,
    validating: true // 订阅验证状态
  }}
>
  {({ input, meta }) => (
    <div>
      <Input {...input} />

      {/* 验证中提示 */}
      {meta.validating && <span>验证中...</span>}

      {/* 错误提示 */}
      {meta.error && meta.touched && !meta.validating && (
        <span>{meta.error}</span>
      )}

      {/* 成功提示 */}
      {!meta.error && meta.touched && !meta.validating && (
        <span>✓ 可用</span>
      )}
    </div>
  )}
</Field>`}</pre>
      </Card>

      {/* 最佳实践 */}
      <Card style={{ marginTop: 16 }} title="💡 最佳实践">
        <div>
          <strong>1. 使用防抖</strong>
          <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
            避免频繁的 API 调用，推荐使用 500-1000ms 的防抖延迟
          </p>

          <strong>2. 订阅 validating 状态</strong>
          <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
            通过订阅 validating 状态，可以显示验证进度，提升用户体验
          </p>

          <strong>3. 组合同步和异步验证</strong>
          <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
            先执行同步验证（如格式检查），通过后再执行异步验证
          </p>

          <strong>4. 错误处理</strong>
          <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
            异步验证失败时要有友好的错误提示，避免静默失败
          </p>

          <strong>5. 取消待处理的请求</strong>
          <p style={{ color: '#666', margin: '8px 0' }}>
            当用户快速切换字段时，应取消之前的验证请求，避免资源浪费
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AsyncValidation
