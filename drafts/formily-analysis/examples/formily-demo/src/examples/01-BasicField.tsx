import React from 'react'
import { createForm } from '@formily/core'
import { FormProvider, Field, FormConsumer } from '@formily/react'
import { FormItem, Input, Select, DatePicker, Radio, Checkbox, Switch, NumberPicker } from '@formily/antd'
import { Card, Button, Space } from 'antd'

/**
 * 基础 Field 组件示例
 *
 * 本示例展示：
 * 1. Field 组件的基本用法 - 最核心的字段组件
 * 2. FormProvider - 提供表单上下文
 * 3. FormConsumer - 消费表单状态
 * 4. 各种 Ant Design 组件的集成
 * 5. 基础的表单验证
 *
 * Field 组件是 Formily 中最基础的字段组件，用于渲染单个表单字段
 * 它会自动连接到表单模型，实现数据双向绑定和验证
 */

// 创建表单实例
// createForm 是 @formily/core 的核心 API，用于创建表单模型
const form = createForm({
  // initialValues: 初始值
  initialValues: {
    username: 'formily',
    email: '',
    age: 18,
    gender: 'male',
    interests: ['reading'],
    newsletter: true,
  },
  // validateFirst: 是否在第一个校验规则失败后停止校验
  validateFirst: true,
})

const BasicFieldDemo: React.FC = () => {
  /**
   * 处理表单提交
   * form.submit 会触发表单校验，校验通过后执行 onSubmit 回调
   */
  const handleSubmit = () => {
    form.submit((values) => {
      console.log('表单值:', values)
      alert('提交成功！查看控制台获取表单数据')
    })
  }

  /**
   * 重置表单
   * form.reset 会将表单重置到初始状态
   */
  const handleReset = () => {
    form.reset()
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">01. 基础 Field 组件</h2>
      <p className="demo-card-description">
        展示 Field 组件的基本用法，包括文本输入、下拉选择、日期选择、单选、多选等常见表单控件。
        Field 是 Formily 最核心的组件，用于渲染和管理单个表单字段。
      </p>

      {/* FormProvider 提供表单上下文，所有子组件都可以访问表单实例 */}
      <FormProvider form={form}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/*
            Field 组件基本用法：
            - name: 字段路径，支持点路径（a.b.c）和数组路径（a[0].b）
            - title: 字段标题
            - required: 是否必填
            - component: 渲染的组件
            - decorator: 装饰器组件（如 FormItem）
            - validator: 校验规则
          */}
          <Field
            name="username"
            title="用户名"
            required
            component={[Input, { placeholder: '请输入用户名' }]}
            decorator={[FormItem]}
            validator={[
              // 自定义校验规则
              {
                validator: (value) => {
                  if (!value) return '用户名不能为空'
                  if (value.length < 3) return '用户名至少3个字符'
                  if (value.length > 20) return '用户名最多20个字符'
                  return ''
                },
              },
            ]}
          />

          <Field
            name="email"
            title="邮箱"
            required
            component={[Input, { placeholder: '请输入邮箱' }]}
            decorator={[FormItem]}
            validator={[
              {
                // 使用正则表达式校验
                pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                message: '请输入有效的邮箱地址',
              },
            ]}
          />

          <Field
            name="age"
            title="年龄"
            required
            component={[NumberPicker, { min: 1, max: 150, style: { width: '100%' } }]}
            decorator={[FormItem]}
            validator={[
              {
                validator: (value) => {
                  if (value < 1 || value > 150) return '年龄必须在1-150之间'
                  return ''
                },
              },
            ]}
          />

          <Field
            name="gender"
            title="性别"
            required
            component={[
              Radio.Group,
              {
                options: [
                  { label: '男', value: 'male' },
                  { label: '女', value: 'female' },
                  { label: '其他', value: 'other' },
                ],
              },
            ]}
            decorator={[FormItem]}
          />

          <Field
            name="city"
            title="城市"
            component={[
              Select,
              {
                placeholder: '请选择城市',
                options: [
                  { label: '北京', value: 'beijing' },
                  { label: '上海', value: 'shanghai' },
                  { label: '广州', value: 'guangzhou' },
                  { label: '深圳', value: 'shenzhen' },
                ],
              },
            ]}
            decorator={[FormItem]}
          />

          <Field
            name="birthdate"
            title="出生日期"
            component={[DatePicker, { style: { width: '100%' } }]}
            decorator={[FormItem]}
          />

          <Field
            name="interests"
            title="兴趣爱好"
            component={[
              Checkbox.Group,
              {
                options: [
                  { label: '阅读', value: 'reading' },
                  { label: '运动', value: 'sports' },
                  { label: '音乐', value: 'music' },
                  { label: '旅游', value: 'travel' },
                ],
              },
            ]}
            decorator={[FormItem]}
          />

          <Field
            name="newsletter"
            title="订阅新闻通讯"
            component={[Switch]}
            decorator={[FormItem]}
          />

          {/* 操作按钮 */}
          <FormItem>
            <Space>
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </FormItem>

          {/*
            FormConsumer 用于消费表单状态
            通过 selector 可以精确订阅需要的状态，避免不必要的重渲染
          */}
          <Card title="表单状态监控" size="small">
            <FormConsumer>
              {(form) => (
                <div className="json-preview">
                  <pre>
                    {JSON.stringify(
                      {
                        values: form.values,
                        valid: form.valid,
                        invalid: form.invalid,
                        errors: form.errors,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </FormConsumer>
          </Card>
        </Space>
      </FormProvider>
    </div>
  )
}

export default BasicFieldDemo
