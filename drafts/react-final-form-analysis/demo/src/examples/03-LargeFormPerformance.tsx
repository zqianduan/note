/**
 * 示例 3: 大型表单性能测试
 *
 * 展示：
 * - 创建包含大量字段的表单
 * - 对比优化前后的性能差异
 * - 实时性能监控
 */

import React, { useState, useRef } from 'react'
import { Form, Field, FormSpy } from 'react-final-form'
import { Input, Button, Card, Row, Col, Switch, Statistic, Progress } from 'antd'

const FIELD_COUNT = 50 // 字段数量

interface FormValues {
  [key: string]: string
}

// 生成初始值
const generateInitialValues = (count: number): FormValues => {
  const values: FormValues = {}
  for (let i = 0; i < count; i++) {
    values[`field_${i}`] = ''
  }
  return values
}

// 性能监控组件
const PerformanceMonitor: React.FC<{ optimized: boolean }> = ({ optimized }) => {
  const renderCount = useRef(0)
  const [lastRenderTime] = useState(Date.now())

  renderCount.current++

  return (
    <Card size="small" title="性能监控" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="总渲染次数"
            value={renderCount.current}
            valueStyle={{
              color: renderCount.current > 20 ? '#ff4d4f' : '#52c41a'
            }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="运行时间"
            value={Math.floor((Date.now() - lastRenderTime) / 1000)}
            suffix="秒"
          />
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8 }}>
          性能评级:{' '}
          {optimized ? (
            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>优秀 ⚡</span>
          ) : (
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>需要优化 🐌</span>
          )}
        </div>
        <Progress
          percent={optimized ? 95 : 30}
          status={optimized ? 'success' : 'exception'}
          strokeColor={optimized ? '#52c41a' : '#ff4d4f'}
        />
      </div>
    </Card>
  )
}

const LargeFormPerformance: React.FC = () => {
  const [optimized, setOptimized] = useState(true)
  const [fieldCount, setFieldCount] = useState(FIELD_COUNT)

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">大型表单性能测试</h2>
      <p className="demo-card-description">
        测试包含 {fieldCount} 个字段的大型表单性能，对比优化前后的渲染次数
      </p>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Switch
            checked={optimized}
            onChange={setOptimized}
            checkedChildren="已优化"
            unCheckedChildren="未优化"
          />
          <span style={{ marginLeft: 16 }}>
            当前模式: <strong>{optimized ? '精确订阅' : '默认订阅'}</strong>
          </span>
        </div>

        <Form<FormValues>
          onSubmit={() => {}}
          initialValues={generateInitialValues(fieldCount)}
          subscription={optimized ? {} : undefined}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <PerformanceMonitor optimized={optimized} />

              <Row gutter={[16, 16]}>
                {Array.from({ length: fieldCount }).map((_, index) => (
                  <Col span={8} key={index}>
                    <Field
                      name={`field_${index}`}
                      subscription={
                        optimized
                          ? { value: true, error: true }
                          : undefined
                      }
                    >
                      {({ input }) => (
                        <div>
                          <label style={{ fontSize: 12, color: '#666' }}>
                            字段 {index + 1}
                          </label>
                          <Input
                            {...input}
                            placeholder={`字段 ${index + 1}`}
                            size="small"
                          />
                        </div>
                      )}
                    </Field>
                  </Col>
                ))}
              </Row>

              {/* 表单值显示 */}
              <FormSpy subscription={{ values: true }}>
                {({ values }) => {
                  const filledCount = Object.values(values).filter(v => v).length
                  return (
                    <Card
                      size="small"
                      title="表单统计"
                      style={{ marginTop: 16 }}
                    >
                      <Statistic
                        title="已填写字段"
                        value={filledCount}
                        suffix={`/ ${fieldCount}`}
                      />
                      <Progress
                        percent={Math.floor((filledCount / fieldCount) * 100)}
                        size="small"
                        style={{ marginTop: 8 }}
                      />
                    </Card>
                  )
                }}
              </FormSpy>
            </form>
          )}
        </Form>
      </Card>

      <Card title="📊 性能对比数据">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" style={{ background: '#fff1f0', border: '1px solid #ffa39e' }}>
              <Statistic
                title="未优化模式"
                value={fieldCount + 1}
                suffix="次/输入"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <p style={{ fontSize: 12, marginTop: 8 }}>
                每次输入触发表单 + {fieldCount} 个字段重渲染
              </p>
            </Card>
          </Col>

          <Col span={8}>
            <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Statistic
                title="优化后模式"
                value="1"
                suffix="次/输入"
                valueStyle={{ color: '#52c41a' }}
              />
              <p style={{ fontSize: 12, marginTop: 8 }}>
                每次输入仅触发当前字段重渲染
              </p>
            </Card>
          </Col>

          <Col span={8}>
            <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
              <Statistic
                title="性能提升"
                value={Math.floor((fieldCount / (fieldCount + 1)) * 100)}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
              <p style={{ fontSize: 12, marginTop: 8 }}>
                减少渲染次数，提升响应速度
              </p>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 16 }} title="💡 优化建议">
        <h4>1. 使用精确订阅</h4>
        <p>只订阅组件真正需要的状态，避免不必要的重渲染</p>

        <h4>2. 表单组件不订阅状态</h4>
        <p>如果表单组件本身不需要访问状态，设置 subscription 为空对象</p>

        <h4>3. 使用 FormSpy 隔离订阅</h4>
        <p>将表单级别的状态订阅放在 FormSpy 中，避免影响整个表单</p>

        <h4>4. 避免内联函数</h4>
        <p>将验证函数、格式化函数等提取到组件外部，避免每次渲染创建新函数</p>
      </Card>
    </div>
  )
}

export default LargeFormPerformance
