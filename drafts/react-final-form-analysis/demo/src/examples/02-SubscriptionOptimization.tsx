/**
 * 示例 2: 订阅优化
 *
 * 展示：
 * - 默认订阅 vs 精确订阅的性能差异
 * - 使用 subscription 属性优化渲染
 * - 使用 FormSpy 隔离状态订阅
 * - 渲染次数统计
 */

import React, { useRef, useState } from 'react'
import { Form, Field, FormSpy } from 'react-final-form'
import { Input, Button, Card, Row, Col, Statistic, Alert, Tag } from 'antd'

interface FormValues {
  field1: string
  field2: string
  field3: string
}

// 渲染计数器组件
const RenderCounter: React.FC<{ label: string }> = ({ label }) => {
  const renderCount = useRef(0)
  renderCount.current++

  return (
    <Tag color={renderCount.current > 10 ? 'red' : 'green'}>
      {label}: {renderCount.current} 次
    </Tag>
  )
}

// 未优化的字段（订阅所有状态）
const UnoptimizedField: React.FC<{ name: string; label: string }> = ({ name, label }) => {
  return (
    <Field name={name}>
      {({ input, meta }) => (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <RenderCounter label={`${label} 渲染`} />
          <label style={{ display: 'block', marginTop: 8, marginBottom: 8 }}>
            {label} (未优化)
          </label>
          <Input {...input} placeholder={`请输入${label}`} />
        </div>
      )}
    </Field>
  )
}

// 优化的字段（只订阅需要的状态）
const OptimizedField: React.FC<{ name: string; label: string }> = ({ name, label }) => {
  return (
    <Field
      name={name}
      subscription={{ value: true, error: true, touched: true }}
    >
      {({ input, meta }) => (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <RenderCounter label={`${label} 渲染`} />
          <label style={{ display: 'block', marginTop: 8, marginBottom: 8 }}>
            {label} (已优化 ⚡)
          </label>
          <Input {...input} placeholder={`请输入${label}`} />
        </div>
      )}
    </Field>
  )
}

const SubscriptionOptimization: React.FC = () => {
  const [showStats, setShowStats] = useState(true)

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">订阅优化对比</h2>
      <p className="demo-card-description">
        对比默认订阅和精确订阅的性能差异，观察渲染次数的变化
      </p>

      <Alert
        message="性能优化提示"
        description={
          <>
            <p>• 默认情况下，Field 会订阅所有字段状态变化</p>
            <p>• 通过 subscription 属性可以精确控制订阅哪些状态</p>
            <p>• 只订阅需要的状态可以大幅减少重渲染次数</p>
            <p>• 使用 FormSpy 可以隔离表单级别的状态订阅</p>
          </>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        {/* 未优化的表单 */}
        <Col span={12}>
          <Card
            title="❌ 未优化（默认订阅）"
            extra={<Tag color="red">性能较差</Tag>}
          >
            <Form<FormValues>
              onSubmit={() => {}}
              initialValues={{ field1: '', field2: '', field3: '' }}
            >
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <UnoptimizedField name="field1" label="字段 1" />
                  <UnoptimizedField name="field2" label="字段 2" />
                  <UnoptimizedField name="field3" label="字段 3" />

                  {/* 显示表单值 - 未优化 */}
                  {showStats && (
                    <FormSpy>
                      {({ values }) => (
                        <Card
                          size="small"
                          title={
                            <>
                              表单值
                              <RenderCounter label="Values 区域渲染" />
                            </>
                          }
                          style={{ marginTop: 16, background: '#f5f5f5' }}
                        >
                          <pre>{JSON.stringify(values, null, 2)}</pre>
                        </Card>
                      )}
                    </FormSpy>
                  )}
                </form>
              )}
            </Form>
          </Card>
        </Col>

        {/* 优化的表单 */}
        <Col span={12}>
          <Card
            title="✅ 已优化（精确订阅）"
            extra={<Tag color="green">高性能</Tag>}
          >
            <Form<FormValues>
              onSubmit={() => {}}
              initialValues={{ field1: '', field2: '', field3: '' }}
              subscription={{}} // 表单组件不订阅任何状态
            >
              {({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <OptimizedField name="field1" label="字段 1" />
                  <OptimizedField name="field2" label="字段 2" />
                  <OptimizedField name="field3" label="字段 3" />

                  {/* 显示表单值 - 优化：使用 FormSpy 隔离订阅 */}
                  {showStats && (
                    <FormSpy subscription={{ values: true }}>
                      {({ values }) => (
                        <Card
                          size="small"
                          title={
                            <>
                              表单值
                              <RenderCounter label="Values 区域渲染" />
                            </>
                          }
                          style={{ marginTop: 16, background: '#f5f5f5' }}
                        >
                          <pre>{JSON.stringify(values, null, 2)}</pre>
                        </Card>
                      )}
                    </FormSpy>
                  )}
                </form>
              )}
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 代码示例 */}
      <Card style={{ marginTop: 24 }} title="💻 代码对比">
        <Row gutter={16}>
          <Col span={12}>
            <h4>❌ 未优化（默认订阅所有状态）</h4>
            <pre className="code-block">{`<Field name="email">
  {({ input, meta }) => (
    <Input {...input} />
  )}
</Field>

// 每次任何状态变化都会重渲染
// 包括: value, error, touched,
// active, dirty, pristine 等`}</pre>
          </Col>

          <Col span={12}>
            <h4>✅ 优化后（只订阅需要的状态）</h4>
            <pre className="code-block">{`<Field
  name="email"
  subscription={{
    value: true,
    error: true,
    touched: true
  }}
>
  {({ input, meta }) => (
    <Input {...input} />
  )}
</Field>

// 只有 value, error, touched
// 变化时才重渲染`}</pre>
          </Col>
        </Row>
      </Card>

      {/* 性能统计 */}
      <Card
        style={{ marginTop: 24 }}
        title="📊 性能对比统计"
      >
        <Alert
          message="性能提升"
          description="在大型表单中（100+ 字段），精确订阅可以减少 90% 以上的重渲染次数"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="未优化表单"
              value="101"
              suffix="次/输入"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              表单组件 + 100 个字段组件
            </p>
          </Col>
          <Col span={8}>
            <Statistic
              title="优化后表单"
              value="1"
              suffix="次/输入"
              valueStyle={{ color: '#52c41a' }}
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              仅当前输入字段
            </p>
          </Col>
          <Col span={8}>
            <Statistic
              title="性能提升"
              value="99"
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              减少重渲染次数
            </p>
          </Col>
        </Row>
      </Card>

      {/* 最佳实践 */}
      <Card style={{ marginTop: 24 }} title="💡 最佳实践">
        <h4>1. Field 组件订阅优化</h4>
        <pre className="code-block">{`// 只订阅真正需要的状态
<Field
  name="email"
  subscription={{
    value: true,     // 用于 input.value
    error: true,     // 用于错误提示
    touched: true,   // 用于判断是否显示错误
  }}
>
  {({ input, meta }) => (
    <div>
      <input {...input} />
      {meta.error && meta.touched && <span>{meta.error}</span>}
    </div>
  )}
</Field>`}</pre>

        <h4 style={{ marginTop: 16 }}>2. Form 组件订阅优化</h4>
        <pre className="code-block">{`// 如果不需要访问表单状态，设置为空对象
<Form
  onSubmit={onSubmit}
  subscription={{}} // 不订阅任何状态
>
  {({ handleSubmit }) => (
    <form onSubmit={handleSubmit}>
      {/* 字段 */}
    </form>
  )}
</Form>`}</pre>

        <h4 style={{ marginTop: 16 }}>3. 使用 FormSpy 隔离订阅</h4>
        <pre className="code-block">{`// 将表单值显示隔离到 FormSpy 中
<FormSpy subscription={{ values: true }}>
  {({ values }) => (
    <pre>{JSON.stringify(values, null, 2)}</pre>
  )}
</FormSpy>

// 这样只有 FormSpy 会在 values 变化时重渲染
// 不影响表单的其他部分`}</pre>
      </Card>
    </div>
  )
}

export default SubscriptionOptimization
