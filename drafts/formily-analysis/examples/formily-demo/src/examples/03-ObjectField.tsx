import React from 'react'
import { createForm } from '@formily/core'
import { FormProvider, ObjectField, Field, FormConsumer } from '@formily/react'
import { FormItem, Input, Select, DatePicker, NumberPicker, FormLayout, FormGrid } from '@formily/antd'
import { Card, Button, Space } from 'antd'

/**
 * ObjectField 对象字段示例
 *
 * 本示例展示：
 * 1. ObjectField 组件的基本用法 - 用于管理对象类型的字段
 * 2. 嵌套对象结构的处理
 * 3. FormLayout 和 FormGrid 布局组件
 * 4. 对象字段的路径访问
 *
 * ObjectField 用于将多个字段组织成一个对象结构
 * 它可以创建嵌套的数据层级，便于管理复杂的表单结构
 */

// 创建表单实例
const form = createForm({
  initialValues: {
    // 用户基本信息
    userInfo: {
      firstName: 'Zhang',
      lastName: 'San',
      age: 25,
      gender: 'male',
    },

    // 联系方式
    contact: {
      phone: '13800138000',
      email: 'zhangsan@example.com',
      address: {
        province: 'beijing',
        city: 'beijing',
        district: 'chaoyang',
        detail: '朝阳区某某街道',
      },
    },

    // 工作信息
    workInfo: {
      company: 'ABC科技公司',
      position: '前端工程师',
      startDate: null,
      salary: 15000,
    },
  },
})

const ObjectFieldDemo: React.FC = () => {
  const handleSubmit = () => {
    form.submit((values) => {
      console.log('表单值:', values)
      alert('提交成功！查看控制台获取表单数据')
    })
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">03. ObjectField 对象字段</h2>
      <p className="demo-card-description">
        展示 ObjectField 组件的使用方法，包括简单对象、嵌套对象的处理，
        以及如何使用 FormLayout 和 FormGrid 来优化表单布局。
      </p>

      <FormProvider form={form}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* ========== 基本对象字段 ========== */}
          <Card title="用户基本信息（ObjectField）" type="inner">
            <p style={{ color: '#666', marginBottom: 16 }}>
              使用 ObjectField 将相关字段组织成一个对象
            </p>

            {/*
              ObjectField 基本用法：
              - name: 对象字段的路径
              - 内部的 Field 使用相对路径访问对象的属性

              例如：ObjectField name="userInfo" 下的 Field name="firstName"
              实际对应的完整路径是 "userInfo.firstName"
            */}
            <ObjectField name="userInfo">
              {/*
                FormLayout 用于控制表单布局
                - layout: 布局方式（horizontal/vertical/inline）
                - labelCol: 标签列宽度
                - wrapperCol: 表单控件列宽度
              */}
              <FormLayout layout="horizontal" labelCol={6} wrapperCol={16}>
                <Field
                  name="firstName"
                  title="名"
                  required
                  component={[Input, { placeholder: '请输入名' }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="lastName"
                  title="姓"
                  required
                  component={[Input, { placeholder: '请输入姓' }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="age"
                  title="年龄"
                  required
                  component={[NumberPicker, { min: 1, max: 150, style: { width: '100%' } }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="gender"
                  title="性别"
                  required
                  component={[
                    Select,
                    {
                      placeholder: '请选择性别',
                      options: [
                        { label: '男', value: 'male' },
                        { label: '女', value: 'female' },
                        { label: '其他', value: 'other' },
                      ],
                    },
                  ]}
                  decorator={[FormItem]}
                />
              </FormLayout>
            </ObjectField>
          </Card>

          {/* ========== 嵌套对象字段 ========== */}
          <Card title="联系方式（嵌套 ObjectField）" type="inner">
            <p style={{ color: '#666', marginBottom: 16 }}>
              ObjectField 可以嵌套使用，创建多层级的数据结构
            </p>

            <ObjectField name="contact">
              <FormLayout layout="horizontal" labelCol={6} wrapperCol={16}>
                <Field
                  name="phone"
                  title="手机号"
                  required
                  component={[Input, { placeholder: '请输入手机号' }]}
                  decorator={[FormItem]}
                  validator={[
                    {
                      pattern: /^1[3-9]\d{9}$/,
                      message: '请输入有效的手机号',
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
                      pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                      message: '请输入有效的邮箱地址',
                    },
                  ]}
                />

                {/* 嵌套的 ObjectField - 地址信息 */}
                <Card size="small" title="详细地址" style={{ marginTop: 16 }}>
                  {/*
                    嵌套的 ObjectField
                    完整路径：contact.address.province / contact.address.city 等
                  */}
                  <ObjectField name="address">
                    {/*
                      FormGrid 提供网格布局
                      - maxColumns: 最大列数
                      - minColumns: 最小列数
                      - columnGap: 列间距
                      - rowGap: 行间距
                    */}
                    <FormGrid maxColumns={2} columnGap={16}>
                      <Field
                        name="province"
                        title="省份"
                        required
                        component={[
                          Select,
                          {
                            placeholder: '请选择省份',
                            options: [
                              { label: '北京市', value: 'beijing' },
                              { label: '上海市', value: 'shanghai' },
                              { label: '广东省', value: 'guangdong' },
                              { label: '浙江省', value: 'zhejiang' },
                            ],
                          },
                        ]}
                        decorator={[FormItem]}
                      />

                      <Field
                        name="city"
                        title="城市"
                        required
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
                        name="district"
                        title="区县"
                        required
                        component={[
                          Select,
                          {
                            placeholder: '请选择区县',
                            options: [
                              { label: '朝阳区', value: 'chaoyang' },
                              { label: '海淀区', value: 'haidian' },
                              { label: '东城区', value: 'dongcheng' },
                              { label: '西城区', value: 'xicheng' },
                            ],
                          },
                        ]}
                        decorator={[FormItem]}
                      />

                      <Field
                        name="detail"
                        title="详细地址"
                        required
                        component={[Input, { placeholder: '请输入详细地址' }]}
                        decorator={[FormItem]}
                      />
                    </FormGrid>
                  </ObjectField>
                </Card>
              </FormLayout>
            </ObjectField>
          </Card>

          {/* ========== 使用 FormGrid 的对象字段 ========== */}
          <Card title="工作信息（使用 FormGrid 布局）" type="inner">
            <p style={{ color: '#666', marginBottom: 16 }}>
              使用 FormGrid 实现响应式网格布局
            </p>

            <ObjectField name="workInfo">
              {/*
                FormGrid 自动响应式布局
                当屏幕宽度不足时，会自动调整列数
              */}
              <FormGrid maxColumns={2} minColumns={1} columnGap={24} rowGap={16}>
                <Field
                  name="company"
                  title="公司名称"
                  required
                  component={[Input, { placeholder: '请输入公司名称' }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="position"
                  title="职位"
                  required
                  component={[Input, { placeholder: '请输入职位' }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="startDate"
                  title="入职日期"
                  component={[DatePicker, { style: { width: '100%' } }]}
                  decorator={[FormItem]}
                />

                <Field
                  name="salary"
                  title="薪资（元/月）"
                  component={[
                    NumberPicker,
                    {
                      min: 0,
                      step: 1000,
                      style: { width: '100%' },
                      formatter: (value: any) =>
                        `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                      parser: (value: any) => value.replace(/¥\s?|(,*)/g, ''),
                    },
                  ]}
                  decorator={[FormItem]}
                />
              </FormGrid>
            </ObjectField>
          </Card>

          {/* 提交按钮 */}
          <FormItem>
            <Space>
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
              <Button onClick={() => form.reset()}>重置</Button>
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

          {/* 说明文档 */}
          <Card title="ObjectField 使用说明" size="small">
            <div style={{ lineHeight: '1.8' }}>
              <h4>主要特点：</h4>
              <ul>
                <li>
                  <strong>数据组织：</strong>将相关字段组织成对象结构，便于管理和维护
                </li>
                <li>
                  <strong>路径访问：</strong>支持点路径访问（如 contact.address.province）
                </li>
                <li>
                  <strong>嵌套支持：</strong>可以无限嵌套，创建复杂的数据层级
                </li>
                <li>
                  <strong>布局灵活：</strong>配合 FormLayout、FormGrid 实现各种布局
                </li>
              </ul>

              <h4 style={{ marginTop: 16 }}>使用场景：</h4>
              <ul>
                <li>用户资料表单：个人信息、联系方式、工作经历等多个部分</li>
                <li>商品管理：基本信息、规格参数、价格库存等</li>
                <li>订单表单：收货地址、商品信息、支付方式等</li>
                <li>任何需要将数据分组组织的场景</li>
              </ul>
            </div>
          </Card>
        </Space>
      </FormProvider>
    </div>
  )
}

export default ObjectFieldDemo
