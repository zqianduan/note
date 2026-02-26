import React from 'react'
import { createForm } from '@formily/core'
import { FormProvider, Field, FormConsumer, observer } from '@formily/react'
import { FormItem, Input, Select, NumberPicker, Switch, DatePicker, Radio } from '@formily/antd'
import { Card, Button, Space, Alert, Tag } from 'antd'

/**
 * Reactions 字段联动完整示例
 *
 * 本示例展示：
 * 1. 值联动 - 一个字段变化影响另一个字段的值
 * 2. 状态联动 - 控制字段的显示/隐藏、启用/禁用
 * 3. 异步联动 - 根据字段值异步加载数据
 * 4. 校验联动 - 动态调整校验规则
 * 5. 样式联动 - 动态改变字段样式
 * 6. 多字段联动 - 多个字段之间的复杂依赖
 *
 * Reactions 是 Formily 最强大的特性之一
 * 通过响应式系统实现字段间的自动联动
 */

// 创建表单实例
const form = createForm()

/**
 * 省市区三级联动数据
 */
const regionData = {
  beijing: {
    name: '北京市',
    cities: {
      beijing: {
        name: '北京市',
        districts: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
      },
    },
  },
  shanghai: {
    name: '上海市',
    cities: {
      shanghai: {
        name: '上海市',
        districts: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区'],
      },
    },
  },
  guangdong: {
    name: '广东省',
    cities: {
      guangzhou: { name: '广州市', districts: ['天河区', '越秀区', '海珠区', '荔湾区'] },
      shenzhen: { name: '深圳市', districts: ['福田区', '南山区', '宝安区', '龙岗区'] },
      dongguan: { name: '东莞市', districts: ['莞城区', '南城区', '东城区', '万江区'] },
    },
  },
}

const ReactionsDemo: React.FC = observer(() => {
  const handleSubmit = () => {
    form.submit((values) => {
      console.log('表单值:', values)
      alert('提交成功！查看控制台获取表单数据')
    })
  }

  const handleReset = () => {
    form.reset()
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">09. Reactions 字段联动</h2>
      <p className="demo-card-description">
        展示 Formily Reactions 的各种联动场景，包括值联动、状态联动、异步联动、
        校验联动等复杂场景的实现方法。
      </p>

      <FormProvider form={form}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* ========== 示例1: 值联动（自动计算）========== */}
          <Card title="示例1: 值联动 - 自动计算总价" type="inner">
            <Alert
              message="功能说明"
              description="数量或单价改变时，自动计算并更新总价"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="quantity"
              title="数量"
              required
              initialValue={1}
              component={[NumberPicker, { min: 0, style: { width: '100%' } }]}
              decorator={[FormItem]}
            />

            <Field
              name="unitPrice"
              title="单价（元）"
              required
              initialValue={100}
              component={[NumberPicker, { min: 0, precision: 2, style: { width: '100%' } }]}
              decorator={[FormItem]}
            />

            <Field
              name="totalPrice"
              title="总价（元）"
              component={[
                NumberPicker,
                {
                  disabled: true,
                  precision: 2,
                  style: { width: '100%' },
                },
              ]}
              decorator={[FormItem]}
              // Reactions: 监听 quantity 和 unitPrice 的变化
              reactions={(field) => {
                const quantity = field.query('quantity').get('value') || 0
                const unitPrice = field.query('unitPrice').get('value') || 0
                field.value = (quantity * unitPrice).toFixed(2)
              }}
            />
          </Card>

          {/* ========== 示例2: 状态联动（显示/隐藏）========== */}
          <Card title="示例2: 状态联动 - 条件显示字段" type="inner">
            <Alert
              message="功能说明"
              description="根据配送方式选择，显示/隐藏对应的配送信息字段"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="deliveryMethod"
              title="配送方式"
              required
              component={[
                Radio.Group,
                {
                  options: [
                    { label: '快递配送', value: 'express' },
                    { label: '门店自提', value: 'pickup' },
                    { label: '上门服务', value: 'onsite' },
                  ],
                },
              ]}
              decorator={[FormItem]}
            />

            {/* 快递配送时显示 */}
            <Field
              name="expressAddress"
              title="配送地址"
              component={[Input.TextArea, { placeholder: '请输入详细配送地址', rows: 3 }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'express'
                field.required = deliveryMethod === 'express'
              }}
            />

            <Field
              name="expressPhone"
              title="收货电话"
              component={[Input, { placeholder: '请输入收货电话' }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'express'
                field.required = deliveryMethod === 'express'
              }}
            />

            {/* 门店自提时显示 */}
            <Field
              name="pickupStore"
              title="自提门店"
              component={[
                Select,
                {
                  placeholder: '请选择自提门店',
                  options: [
                    { label: '朝阳门店', value: 'chaoyang' },
                    { label: '海淀门店', value: 'haidian' },
                    { label: '西城门店', value: 'xicheng' },
                  ],
                },
              ]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'pickup'
                field.required = deliveryMethod === 'pickup'
              }}
            />

            <Field
              name="pickupTime"
              title="自提时间"
              component={[DatePicker, { showTime: true, style: { width: '100%' } }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'pickup'
                field.required = deliveryMethod === 'pickup'
              }}
            />

            {/* 上门服务时显示 */}
            <Field
              name="onsiteAddress"
              title="服务地址"
              component={[Input.TextArea, { placeholder: '请输入上门服务地址', rows: 3 }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'onsite'
                field.required = deliveryMethod === 'onsite'
              }}
            />

            <Field
              name="onsiteTime"
              title="预约时间"
              component={[DatePicker, { showTime: true, style: { width: '100%' } }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const deliveryMethod = field.query('deliveryMethod').get('value')
                field.visible = deliveryMethod === 'onsite'
                field.required = deliveryMethod === 'onsite'
              }}
            />
          </Card>

          {/* ========== 示例3: 省市区三级联动 ========== */}
          <Card title="示例3: 省市区三级联动" type="inner">
            <Alert
              message="功能说明"
              description="选择省份后自动更新城市列表，选择城市后自动更新区县列表"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="province"
              title="省份"
              required
              component={[
                Select,
                {
                  placeholder: '请选择省份',
                  options: Object.keys(regionData).map((key) => ({
                    label: regionData[key as keyof typeof regionData].name,
                    value: key,
                  })),
                },
              ]}
              decorator={[FormItem]}
            />

            <Field
              name="city"
              title="城市"
              required
              component={[Select, { placeholder: '请先选择省份' }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const province = field.query('province').get('value')

                // 清空城市和区县
                ;(field as any).value = undefined
                const districtField = field.query('district').take()
                if (districtField) {
                  ;(districtField as any).value = undefined
                }

                if (province) {
                  const cities = (regionData as any)[province].cities
                  field.dataSource = Object.keys(cities).map((key) => ({
                    label: (cities as any)[key].name,
                    value: key,
                  }))
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '请选择城市',
                  }
                } else {
                  field.dataSource = []
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '请先选择省份',
                  }
                }
              }}
            />

            <Field
              name="district"
              title="区县"
              required
              component={[Select, { placeholder: '请先选择城市' }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const province = field.query('province').get('value')
                const city = field.query('city').get('value')

                // 清空区县
                ;(field as any).value = undefined

                if (province && city) {
                  const districts = ((regionData as any)[province].cities as any)[city].districts
                  field.dataSource = districts.map((d: string) => ({
                    label: d,
                    value: d,
                  }))
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '请选择区县',
                  }
                } else {
                  field.dataSource = []
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '请先选择城市',
                  }
                }
              }}
            />
          </Card>

          {/* ========== 示例4: 校验联动 ========== */}
          <Card title="示例4: 校验联动 - 动态校验规则" type="inner">
            <Alert
              message="功能说明"
              description="开启高级模式后，配置字段变为必填且需要至少50个字符"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="advancedMode"
              title="高级模式"
              component={[Switch]}
              decorator={[FormItem]}
            />

            <Field
              name="config"
              title="配置"
              component={[Input.TextArea, { placeholder: '请输入配置', rows: 5 }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const advancedMode = field.query('advancedMode').get('value')

                if (advancedMode) {
                  field.required = true
                  field.validator = [
                    {
                      required: true,
                      message: '高级模式下配置不能为空',
                    },
                    {
                      min: 50,
                      message: '高级模式下配置至少需要50个字符',
                    },
                  ]
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '高级模式：请输入至少50个字符的配置',
                  }
                } else {
                  field.required = false
                  field.validator = []
                  field.componentProps = {
                    ...field.componentProps,
                    placeholder: '普通模式：可选填写配置',
                  }
                }
              }}
            />
          </Card>

          {/* ========== 示例5: 样式联动 ========== */}
          <Card title="示例5: 样式联动 - 动态样式" type="inner">
            <Alert
              message="功能说明"
              description="根据优先级选择，动态改变输入框的边框颜色和背景色"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="priority"
              title="优先级"
              required
              component={[
                Select,
                {
                  placeholder: '请选择优先级',
                  options: [
                    { label: '低', value: 'low' },
                    { label: '中', value: 'medium' },
                    { label: '高', value: 'high' },
                    { label: '紧急', value: 'urgent' },
                  ],
                },
              ]}
              decorator={[FormItem]}
            />

            <Field
              name="taskDescription"
              title="任务描述"
              required
              component={[Input.TextArea, { rows: 4 }]}
              decorator={[FormItem]}
              reactions={(field) => {
                const priority = field.query('priority').get('value')

                const styleMap: Record<string, any> = {
                  low: {
                    borderColor: '#52c41a',
                    backgroundColor: '#f6ffed',
                  },
                  medium: {
                    borderColor: '#1890ff',
                    backgroundColor: '#e6f7ff',
                  },
                  high: {
                    borderColor: '#faad14',
                    backgroundColor: '#fffbe6',
                  },
                  urgent: {
                    borderColor: '#ff4d4f',
                    backgroundColor: '#fff1f0',
                  },
                }

                const style = styleMap[priority] || {}

                field.componentProps = {
                  ...field.componentProps,
                  style: {
                    ...style,
                    width: '100%',
                  },
                  placeholder: priority
                    ? `${priority.toUpperCase()} 优先级任务描述`
                    : '请先选择优先级',
                }
              }}
            />
          </Card>

          {/* ========== 示例6: 异步联动 ========== */}
          <Card title="示例6: 异步联动 - 根据用户名加载信息" type="inner">
            <Alert
              message="功能说明"
              description="输入用户名后，自动加载用户的邮箱和手机号（模拟异步请求）"
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Field
              name="asyncUsername"
              title="用户名"
              required
              component={[Input, { placeholder: '请输入用户名（至少3个字符）' }]}
              decorator={[FormItem]}
              reactions={async (field) => {
                const username = field.value

                if (!username || username.length < 3) {
                  // 清空自动填充的字段
                  field.form.setFieldState('asyncEmail', (state) => {
                    state.value = undefined
                  })
                  field.form.setFieldState('asyncPhone', (state) => {
                    state.value = undefined
                  })
                  return
                }

                // 设置加载状态
                field.setLoading(true)

                try {
                  // 模拟异步请求
                  await new Promise((resolve) => setTimeout(resolve, 1000))

                  // 模拟返回的用户信息
                  const mockUserInfo = {
                    email: `${username}@example.com`,
                    phone: `138${Math.floor(Math.random() * 100000000)}`,
                  }

                  // 自动填充
                  field.form.setValues({
                    asyncEmail: mockUserInfo.email,
                    asyncPhone: mockUserInfo.phone,
                  })
                } finally {
                  field.setLoading(false)
                }
              }}
            />

            <Field
              name="asyncEmail"
              title="邮箱（自动填充）"
              component={[Input, { disabled: true }]}
              decorator={[FormItem]}
            />

            <Field
              name="asyncPhone"
              title="手机号（自动填充）"
              component={[Input, { disabled: true }]}
              decorator={[FormItem]}
            />
          </Card>

          {/* 操作按钮 */}
          <FormItem>
            <Space>
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </FormItem>

          {/* 表单状态监控 */}
          <Card title="表单状态监控" size="small">
            <FormConsumer>
              {(form) => (
                <div className="json-preview">
                  <pre>{JSON.stringify(form.values, null, 2)}</pre>
                </div>
              )}
            </FormConsumer>
          </Card>

          {/* 使用说明 */}
          <Card title="Reactions 使用说明" size="small">
            <div style={{ lineHeight: '1.8' }}>
              <h4>Reactions 的实现方式：</h4>
              <ul>
                <li>
                  <strong>函数式 Reactions:</strong> 在 Field 组件上使用 reactions 属性，传入函数
                </li>
                <li>
                  <strong>JSON Schema Reactions:</strong> 在 Schema 中使用 x-reactions 配置
                </li>
                <li>
                  <strong>FormEffects:</strong> 在 createForm 的 effects 中使用 onFieldReact
                </li>
              </ul>

              <h4 style={{ marginTop: 16 }}>常用联动场景：</h4>
              <ul>
                <li>
                  <strong>值联动:</strong> 根据其他字段的值自动计算当前字段的值
                </li>
                <li>
                  <strong>状态联动:</strong> 控制字段的显示/隐藏、启用/禁用、只读等状态
                </li>
                <li>
                  <strong>数据源联动:</strong> 根据其他字段的值更新当前字段的选项列表
                </li>
                <li>
                  <strong>校验联动:</strong> 根据条件动态调整校验规则
                </li>
                <li>
                  <strong>样式联动:</strong> 根据条件动态改变字段样式
                </li>
                <li>
                  <strong>异步联动:</strong> 根据字段值异步加载数据
                </li>
              </ul>

              <h4 style={{ marginTop: 16 }}>最佳实践：</h4>
              <ul>
                <li>使用 field.query() 获取其他字段的值和状态</li>
                <li>避免循环依赖（A 影响 B，B 又影响 A）</li>
                <li>异步操作要正确处理 loading 状态</li>
                <li>使用 field.setComponentProps() 动态更新组件属性</li>
                <li>复杂联动建议抽取成独立的 reactions 函数</li>
              </ul>
            </div>
          </Card>
        </Space>
      </FormProvider>
    </div>
  )
})

export default ReactionsDemo
