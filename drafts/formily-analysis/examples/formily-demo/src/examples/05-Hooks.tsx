import React, { useEffect } from 'react'
import { createForm } from '@formily/core'
import {
  FormProvider,
  Field,
  FormConsumer,
  useForm,
  useField,
  useFieldSchema,
  useFormEffects,
  useParentForm,
  useExpressionScope,
  observer,
} from '@formily/react'
import { FormItem, Input, Select, NumberPicker } from '@formily/antd'
import { Card, Button, Space, Alert, Tag } from 'antd'
import { onFieldValueChange, onFieldInputValueChange } from '@formily/core'

/**
 * Formily Hooks 完整示例
 *
 * 本示例展示所有 @formily/react 提供的 Hooks：
 * 1. useForm - 获取表单实例
 * 2. useField - 获取当前字段实例
 * 3. useFieldSchema - 获取字段 Schema
 * 4. useFormEffects - 注册表单副作用
 * 5. useParentForm - 获取父级表单实例
 * 6. useExpressionScope - 获取表达式作用域
 * 7. observer - 响应式组件包装器
 */

// 创建表单实例
const form = createForm()

/**
 * 自定义输入组件 - 展示 useField Hook
 *
 * useField 用于在组件内部获取当前字段的实例
 * 字段实例包含：value, errors, warnings, loading, validating 等状态
 */
const CustomInput: React.FC<any> = observer((props) => {
  // useField 获取当前字段实例
  // 使用 any 类型以避免 VoidField 类型错误，因为此组件只用于数据字段
  const field = useField<any>()

  // useFieldSchema 获取字段的 Schema 配置
  const schema = useFieldSchema()

  return (
    <div>
      <Input
        {...props}
        value={field.value}
        onChange={(e) => {
          field.setValue(e.target.value)
        }}
        status={field.errors.length > 0 ? 'error' : undefined}
      />

      {/* 显示字段状态信息 */}
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        <Space>
          <span>字段路径: {field.path.toString()}</span>
          <span>字段值: {field.value || '(空)'}</span>
          <span>是否校验中: {field.validating ? '是' : '否'}</span>
          {field.errors.length > 0 && (
            <Tag color="error">错误: {field.errors[0]}</Tag>
          )}
        </Space>
      </div>
    </div>
  )
})

/**
 * 展示 useFormEffects 的组件
 *
 * useFormEffects 用于在组件内部注册表单副作用
 * 常用于监听字段变化、实现联动逻辑
 */
const FormEffectsDemo: React.FC = observer(() => {
  // useForm 获取当前表单实例
  const form = useForm()

  // 用于显示联动信息
  const [effectLog, setEffectLog] = React.useState<string[]>([])

  /**
   * useFormEffects 注册表单副作用
   * 参数是一个回调函数，在其中可以监听各种表单事件
   */
  useFormEffects(() => {
    // 监听 username 字段值变化
    onFieldValueChange('username', (field) => {
      setEffectLog((prev) => [
        ...prev,
        `username 值变化: ${field.value}`,
      ])

      // 当 username 长度 > 5 时，自动填充 email
      if (field.value && field.value.length > 5) {
        form.setFieldState('email', (state) => {
          state.value = `${field.value}@example.com`
        })
      }
    })

    // 监听 age 字段输入值变化（输入过程中触发）
    onFieldInputValueChange('age', (field) => {
      setEffectLog((prev) => [
        ...prev,
        `age 输入值: ${field.inputValue}`,
      ])

      // 根据年龄自动设置等级
      const age = Number(field.inputValue)
      if (age >= 18 && age < 60) {
        form.setFieldState('level', (state) => {
          state.value = 'adult'
        })
      } else if (age >= 60) {
        form.setFieldState('level', (state) => {
          state.value = 'senior'
        })
      } else {
        form.setFieldState('level', (state) => {
          state.value = 'youth'
        })
      }
    })
  })

  return (
    <Card title="useFormEffects 演示" size="small" style={{ marginTop: 16 }}>
      <Alert
        message="表单副作用日志"
        description={
          <div style={{ maxHeight: 150, overflow: 'auto' }}>
            {effectLog.length === 0 ? (
              <div style={{ color: '#999' }}>暂无日志，请修改表单字段...</div>
            ) : (
              effectLog.map((log, index) => (
                <div key={index} style={{ fontSize: 12, padding: '2px 0' }}>
                  {index + 1}. {log}
                </div>
              ))
            )}
          </div>
        }
        type="info"
        style={{ marginBottom: 16 }}
      />

      <Button size="small" onClick={() => setEffectLog([])}>
        清空日志
      </Button>
    </Card>
  )
})

/**
 * 展示 useExpressionScope 的组件
 *
 * useExpressionScope 用于获取表达式作用域
 * 可以在作用域中注入自定义变量和函数供表达式使用
 */
const ExpressionScopeDemo: React.FC = observer(() => {
  const form = useForm()

  // 自定义表达式作用域
  const scope = useExpressionScope()

  return (
    <Card title="useExpressionScope 演示" size="small" style={{ marginTop: 16 }}>
      <Alert
        message="表达式作用域"
        description={
          <pre style={{ fontSize: 12, margin: 0 }}>
            {JSON.stringify(scope, null, 2)}
          </pre>
        }
        type="info"
      />
    </Card>
  )
})

/**
 * 展示 useParentForm 的嵌套表单组件
 */
const NestedFormDemo: React.FC = observer(() => {
  // useParentForm 获取父级表单实例
  // 在嵌套表单场景中很有用
  const parentForm = useParentForm()

  return (
    <Card title="useParentForm 演示" size="small" style={{ marginTop: 16 }}>
      <Alert
        message="父表单信息"
        description={
          <div style={{ fontSize: 12 }}>
            <div>父表单是否存在: {parentForm ? '是' : '否'}</div>
            {parentForm && (
              <>
                <div>父表单字段数: {Object.keys((parentForm as any).fields || {}).length}</div>
                <div>父表单是否有效: {(parentForm as any).valid ? '是' : '否'}</div>
              </>
            )}
          </div>
        }
        type="info"
      />
    </Card>
  )
})

/**
 * 主组件 - Hooks 综合示例
 */
const HooksDemo: React.FC = () => {
  // ===== useForm Hook =====
  // 在 FormProvider 内部使用 useForm 可以获取表单实例
  // 也可以直接使用外部创建的 form 实例

  const handleSubmit = () => {
    form.submit((values) => {
      console.log('表单值:', values)
      alert('提交成功！查看控制台获取表单数据')
    })
  }

  const handleReset = () => {
    form.reset()
  }

  // 演示表单 API 调用
  const handleSetValues = () => {
    form.setValues({
      username: 'formily_user',
      age: 25,
      email: 'formily_user@example.com',
      level: 'adult',
    })
  }

  const handleGetField = () => {
    const usernameField = form.query('username').take()
    if (usernameField) {
      alert(`username 字段当前值: ${(usernameField as any).value}`)
    }
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">05. Formily Hooks</h2>
      <p className="demo-card-description">
        展示 @formily/react 提供的所有核心 Hooks 的使用方法，包括 useForm、useField、
        useFieldSchema、useFormEffects、useParentForm、useExpressionScope 等。
      </p>

      <FormProvider form={form}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* ========== useForm 示例 ========== */}
          <Card title="useForm - 获取表单实例" type="inner">
            <p style={{ color: '#666', marginBottom: 16 }}>
              useForm 用于在组件中获取表单实例，可以调用表单的各种方法
            </p>

            {/* 基本表单字段 */}
            <Field
              name="username"
              title="用户名"
              required
              component={[Input, { placeholder: '请输入用户名（>5个字符自动填充邮箱）' }]}
              decorator={[FormItem]}
              validator={[
                {
                  validator: (value) => {
                    if (!value) return '用户名不能为空'
                    if (value.length < 3) return '用户名至少3个字符'
                    return ''
                  },
                },
              ]}
            />

            <Field
              name="age"
              title="年龄"
              required
              component={[NumberPicker, { min: 1, max: 150, style: { width: '100%' } }]}
              decorator={[FormItem]}
            />

            <Field
              name="email"
              title="邮箱"
              required
              component={[Input, { placeholder: '邮箱（会根据用户名自动填充）', disabled: true }]}
              decorator={[FormItem]}
            />

            <Field
              name="level"
              title="等级"
              component={[
                Select,
                {
                  placeholder: '等级（根据年龄自动设置）',
                  disabled: true,
                  options: [
                    { label: '青少年', value: 'youth' },
                    { label: '成年人', value: 'adult' },
                    { label: '老年人', value: 'senior' },
                  ],
                },
              ]}
              decorator={[FormItem]}
            />

            {/* 表单操作按钮 */}
            <Space wrap>
              <Button type="primary" onClick={handleSubmit}>
                提交表单
              </Button>
              <Button onClick={handleReset}>重置表单</Button>
              <Button onClick={handleSetValues}>设置表单值</Button>
              <Button onClick={handleGetField}>获取 username 字段</Button>
            </Space>
          </Card>

          {/* ========== useField & useFieldSchema 示例 ========== */}
          <Card title="useField & useFieldSchema - 自定义组件" type="inner">
            <p style={{ color: '#666', marginBottom: 16 }}>
              useField 和 useFieldSchema 用于在自定义组件中获取字段实例和配置
            </p>

            <Field
              name="custom"
              title="自定义输入框"
              component={[CustomInput, { placeholder: '这是使用 useField 的自定义组件' }]}
              decorator={[FormItem]}
              required
              validator={[
                {
                  validator: (value) => {
                    if (!value) return '不能为空'
                    if (value.length < 5) return '至少5个字符'
                    return ''
                  },
                },
              ]}
            />
          </Card>

          {/* ========== useFormEffects 示例 ========== */}
          <FormEffectsDemo />

          {/* ========== useExpressionScope 示例 ========== */}
          <ExpressionScopeDemo />

          {/* ========== useParentForm 示例 ========== */}
          <NestedFormDemo />

          {/* ========== observer 包装器 ========== */}
          <Card title="observer - 响应式组件包装器" type="inner">
            <Alert
              message="observer 说明"
              description={
                <div style={{ lineHeight: '1.8' }}>
                  <p>
                    observer 是 @formily/reactive-react 提供的响应式包装器，
                    用于将普通组件转换为响应式组件。
                  </p>
                  <p>
                    被 observer 包装的组件会自动追踪其内部访问的响应式数据，
                    当这些数据变化时，组件会自动重新渲染。
                  </p>
                  <p>
                    在 Formily 中，useForm、useField 等 Hook 返回的对象都是响应式的，
                    必须在 observer 包装的组件中使用才能实现自动更新。
                  </p>
                </div>
              }
              type="info"
            />
          </Card>

          {/* 表单状态监控 */}
          <Card title="表单状态监控（使用 FormConsumer）" size="small">
            <FormConsumer>
              {(form) => (
                <div className="json-preview">
                  <pre>
                    {JSON.stringify(
                      {
                        values: form.values,
                        valid: form.valid,
                        errors: form.errors,
                        fieldCount: Object.keys(form.fields).length,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </FormConsumer>
          </Card>

          {/* Hooks 使用说明 */}
          <Card title="Hooks 使用说明" size="small">
            <div style={{ lineHeight: '1.8' }}>
              <h4>核心 Hooks：</h4>
              <ul>
                <li>
                  <strong>useForm():</strong> 获取表单实例，可以调用 submit、reset、setValues 等方法
                </li>
                <li>
                  <strong>useField():</strong> 获取当前字段实例，包含 value、errors、validating 等状态
                </li>
                <li>
                  <strong>useFieldSchema():</strong> 获取字段的 Schema 配置信息
                </li>
                <li>
                  <strong>useFormEffects():</strong> 注册表单副作用，监听字段变化、实现联动逻辑
                </li>
                <li>
                  <strong>useParentForm():</strong> 获取父级表单实例，用于嵌套表单场景
                </li>
                <li>
                  <strong>useExpressionScope():</strong> 获取表达式作用域，可注入自定义变量
                </li>
              </ul>

              <h4 style={{ marginTop: 16 }}>注意事项：</h4>
              <ul>
                <li>所有 Hooks 必须在 FormProvider 内部使用</li>
                <li>useField 和 useFieldSchema 必须在 Field 组件的自定义组件中使用</li>
                <li>使用 Hooks 的组件建议用 observer 包装，确保响应式更新</li>
                <li>useFormEffects 中的副作用会在组件挂载时注册，卸载时自动清理</li>
              </ul>
            </div>
          </Card>
        </Space>
      </FormProvider>
    </div>
  )
}

export default HooksDemo
