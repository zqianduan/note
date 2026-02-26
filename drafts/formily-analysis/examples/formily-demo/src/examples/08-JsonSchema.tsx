import React, { useState } from 'react'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  DatePicker,
  NumberPicker,
  Switch,
  Radio,
  Checkbox,
  FormLayout,
  FormGrid,
  ArrayItems,
  FormTab,
  FormCollapse,
} from '@formily/antd'
import { Card, Button, Space, Alert, Tabs } from 'antd'
import { ISchema } from '@formily/json-schema'

const { TabPane } = Tabs

/**
 * JSON Schema 动态表单示例
 *
 * 本示例展示：
 * 1. 使用 JSON Schema 定义表单结构
 * 2. x-reactions 实现复杂的字段联动
 * 3. x-decorator 和 x-component 配置
 * 4. 动态表单渲染
 * 5. 复杂的业务场景
 *
 * JSON Schema 是 Formily 的核心特性，允许通过配置化方式定义表单：
 * - 降低维护成本
 * - 便于动态生成表单
 * - 支持服务端配置
 */

// 创建 SchemaField 组件
// SchemaField 用于将 JSON Schema 渲染成表单
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    DatePicker,
    NumberPicker,
    Switch,
    Radio,
    Checkbox,
    FormLayout,
    FormGrid,
    ArrayItems,
    FormTab,
    FormCollapse,
    Space,
  },
})

// ========== Schema 示例 1: 用户注册表单 ==========
const registerSchema: ISchema = {
  type: 'object',
  properties: {
    // 账号类型
    accountType: {
      type: 'string',
      title: '账号类型',
      enum: [
        { label: '个人账号', value: 'personal' },
        { label: '企业账号', value: 'enterprise' },
      ],
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      'x-component-props': {
        optionType: 'button',
      },
      default: 'personal',
    },

    // 个人用户字段 - 根据账号类型动态显示
    username: {
      type: 'string',
      title: '用户名',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入用户名',
      },
      // x-reactions 实现联动
      'x-reactions': {
        // dependencies: 依赖的字段
        dependencies: ['.accountType'],
        // fulfill: 当依赖字段变化时执行
        fulfill: {
          // state: 更新当前字段的状态
          state: {
            // $deps[0] 表示第一个依赖字段的值
            visible: "{{$deps[0] === 'personal'}}",
            required: "{{$deps[0] === 'personal'}}",
          },
        },
      },
      'x-validator': [
        {
          required: true,
          message: '请输入用户名',
        },
        {
          min: 3,
          max: 20,
          message: '用户名长度为3-20个字符',
        },
      ],
    },

    // 邮箱
    email: {
      type: 'string',
      title: '邮箱',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入邮箱',
      },
      'x-reactions': {
        dependencies: ['.accountType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'personal'}}",
            required: "{{$deps[0] === 'personal'}}",
          },
        },
      },
      'x-validator': [
        {
          pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
          message: '请输入有效的邮箱地址',
        },
      ],
    },

    // 企业用户字段
    companyName: {
      type: 'string',
      title: '公司名称',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入公司名称',
      },
      'x-reactions': {
        dependencies: ['.accountType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}",
          },
        },
      },
    },

    companyEmail: {
      type: 'string',
      title: '企业邮箱',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入企业邮箱',
      },
      'x-reactions': {
        dependencies: ['.accountType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}",
          },
        },
      },
    },

    businessLicense: {
      type: 'string',
      title: '营业执照号',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        placeholder: '请输入营业执照号',
      },
      'x-reactions': {
        dependencies: ['.accountType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}",
          },
        },
      },
    },

    // 密码
    password: {
      type: 'string',
      title: '密码',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        type: 'password',
        placeholder: '请输入密码',
      },
      'x-validator': [
        {
          required: true,
          message: '请输入密码',
        },
        {
          min: 6,
          max: 20,
          message: '密码长度为6-20个字符',
        },
      ],
    },

    confirmPassword: {
      type: 'string',
      title: '确认密码',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      'x-component-props': {
        type: 'password',
        placeholder: '请再次输入密码',
      },
      'x-reactions': {
        dependencies: ['.password'],
        fulfill: {
          state: {
            // 自定义校验：确认密码必须与密码一致
            errors:
              "{{$deps[0] && $self.value && $self.value !== $deps[0] ? '两次密码输入不一致' : ''}}",
          },
        },
      },
    },
  },
}

// ========== Schema 示例 2: 商品管理表单（复杂联动）==========
const productSchema: ISchema = {
  type: 'object',
  properties: {
    layout: {
      type: 'void',
      'x-component': 'FormLayout',
      'x-component-props': {
        labelCol: 6,
        wrapperCol: 16,
      },
      properties: {
        // 商品类型
        productType: {
          type: 'string',
          title: '商品类型',
          enum: [
            { label: '实物商品', value: 'physical' },
            { label: '虚拟商品', value: 'virtual' },
            { label: '服务商品', value: 'service' },
          ],
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择商品类型',
          },
          default: 'physical',
        },

        // 商品名称
        productName: {
          type: 'string',
          title: '商品名称',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-component-props': {
            placeholder: '请输入商品名称',
          },
        },

        // 商品分类
        category: {
          type: 'string',
          title: '商品分类',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择商品分类',
          },
          // 动态选项 - 根据商品类型变化
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                value: '',
                // 根据商品类型提供不同的分类选项
                dataSource:
                  "{{$deps[0] === 'physical' ? [{label:'电子产品',value:'electronics'},{label:'服装',value:'clothing'},{label:'食品',value:'food'}] : $deps[0] === 'virtual' ? [{label:'软件',value:'software'},{label:'游戏',value:'game'},{label:'课程',value:'course'}] : [{label:'咨询服务',value:'consulting'},{label:'维修服务',value:'repair'},{label:'培训服务',value:'training'}]}}",
              },
            },
          },
        },

        // 价格
        price: {
          type: 'number',
          title: '价格（元）',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            min: 0,
            precision: 2,
            style: { width: '100%' },
          },
        },

        // 折扣开关
        enableDiscount: {
          type: 'boolean',
          title: '启用折扣',
          'x-decorator': 'FormItem',
          'x-component': 'Switch',
          default: false,
        },

        // 折扣率 - 根据折扣开关显示
        discountRate: {
          type: 'number',
          title: '折扣率（%）',
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            min: 0,
            max: 100,
            style: { width: '100%' },
          },
          'x-reactions': {
            dependencies: ['.enableDiscount'],
            fulfill: {
              state: {
                visible: '{{$deps[0]}}',
                required: '{{$deps[0]}}',
              },
            },
          },
        },

        // 最终价格 - 自动计算
        finalPrice: {
          type: 'number',
          title: '最终价格（元）',
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            disabled: true,
            style: { width: '100%' },
          },
          'x-reactions': {
            dependencies: ['.price', '.enableDiscount', '.discountRate'],
            fulfill: {
              state: {
                // 计算最终价格
                value:
                  '{{$deps[1] && $deps[2] ? ($deps[0] * (100 - $deps[2]) / 100).toFixed(2) : $deps[0]}}',
              },
            },
          },
        },

        // 实物商品特有字段
        weight: {
          type: 'number',
          title: '重量（kg）',
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            min: 0,
            precision: 2,
            style: { width: '100%' },
          },
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                visible: "{{$deps[0] === 'physical'}}",
                required: "{{$deps[0] === 'physical'}}",
              },
            },
          },
        },

        shippingMethod: {
          type: 'string',
          title: '配送方式',
          enum: [
            { label: '快递', value: 'express' },
            { label: '物流', value: 'logistics' },
            { label: '自提', value: 'pickup' },
          ],
          'x-decorator': 'FormItem',
          'x-component': 'Radio.Group',
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                visible: "{{$deps[0] === 'physical'}}",
                required: "{{$deps[0] === 'physical'}}",
              },
            },
          },
        },

        // 虚拟商品特有字段
        deliveryType: {
          type: 'string',
          title: '交付方式',
          enum: [
            { label: '激活码', value: 'code' },
            { label: '下载链接', value: 'download' },
            { label: '在线使用', value: 'online' },
          ],
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择交付方式',
          },
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                visible: "{{$deps[0] === 'virtual'}}",
                required: "{{$deps[0] === 'virtual'}}",
              },
            },
          },
        },

        // 服务商品特有字段
        serviceDuration: {
          type: 'number',
          title: '服务时长（小时）',
          'x-decorator': 'FormItem',
          'x-component': 'NumberPicker',
          'x-component-props': {
            min: 0,
            style: { width: '100%' },
          },
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                visible: "{{$deps[0] === 'service'}}",
                required: "{{$deps[0] === 'service'}}",
              },
            },
          },
        },

        serviceArea: {
          type: 'string',
          title: '服务区域',
          enum: [
            { label: '全国', value: 'nationwide' },
            { label: '本地', value: 'local' },
            { label: '上门服务', value: 'onsite' },
          ],
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          'x-component-props': {
            placeholder: '请选择服务区域',
          },
          'x-reactions': {
            dependencies: ['.productType'],
            fulfill: {
              state: {
                visible: "{{$deps[0] === 'service'}}",
                required: "{{$deps[0] === 'service'}}",
              },
            },
          },
        },
      },
    },
  },
}

// ========== Schema 示例 3: 动态数组表单 ==========
const dynamicArraySchema: ISchema = {
  type: 'object',
  properties: {
    // 使用 ArrayItems 组件
    contacts: {
      type: 'array',
      title: '联系人列表',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        properties: {
          space: {
            type: 'void',
            'x-component': 'Space',
            properties: {
              sort: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems.SortHandle',
              },
              name: {
                type: 'string',
                title: '姓名',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入姓名',
                },
              },
              phone: {
                type: 'string',
                title: '电话',
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入电话',
                },
              },
              remove: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems.Remove',
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: '添加联系人',
          'x-component': 'ArrayItems.Addition',
        },
      },
    },
  },
}

/**
 * 主组件
 */
const JsonSchemaDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1')

  // 创建表单实例
  const registerForm = createForm()
  const productForm = createForm()
  const arrayForm = createForm()

  const handleSubmit = (form: any, name: string) => {
    form.submit((values: any) => {
      console.log(`${name} 表单值:`, values)
      alert(`${name} 提交成功！查看控制台获取数据`)
    })
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">08. JSON Schema 动态表单</h2>
      <p className="demo-card-description">
        展示如何使用 JSON Schema 定义表单结构，实现复杂的字段联动和动态表单渲染。
      </p>

      <Alert
        message="JSON Schema 核心概念"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>type:</strong> 字段类型（string, number, boolean, object, array 等）
            </li>
            <li>
              <strong>x-component:</strong> 指定渲染的组件
            </li>
            <li>
              <strong>x-decorator:</strong> 指定装饰器组件（通常是 FormItem）
            </li>
            <li>
              <strong>x-reactions:</strong> 定义字段联动逻辑
            </li>
            <li>
              <strong>x-validator:</strong> 定义校验规则
            </li>
          </ul>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="用户注册表单" key="1">
          <Card>
            <FormProvider form={registerForm}>
              <SchemaField schema={registerSchema} />
              <FormItem>
                <Space>
                  <Button type="primary" onClick={() => handleSubmit(registerForm, '注册表单')}>
                    提交
                  </Button>
                  <Button onClick={() => registerForm.reset()}>重置</Button>
                </Space>
              </FormItem>
            </FormProvider>
          </Card>
        </TabPane>

        <TabPane tab="商品管理表单" key="2">
          <Card>
            <FormProvider form={productForm}>
              <SchemaField schema={productSchema} />
              <FormItem>
                <Space>
                  <Button type="primary" onClick={() => handleSubmit(productForm, '商品表单')}>
                    提交
                  </Button>
                  <Button onClick={() => productForm.reset()}>重置</Button>
                </Space>
              </FormItem>
            </FormProvider>
          </Card>
        </TabPane>

        <TabPane tab="动态数组表单" key="3">
          <Card>
            <FormProvider form={arrayForm}>
              <SchemaField schema={dynamicArraySchema} />
              <FormItem>
                <Space>
                  <Button type="primary" onClick={() => handleSubmit(arrayForm, '数组表单')}>
                    提交
                  </Button>
                  <Button onClick={() => arrayForm.reset()}>重置</Button>
                </Space>
              </FormItem>
            </FormProvider>
          </Card>
        </TabPane>
      </Tabs>

      <Card title="JSON Schema 使用说明" size="small" style={{ marginTop: 24 }}>
        <div style={{ lineHeight: '1.8' }}>
          <h4>x-reactions 联动配置：</h4>
          <ul>
            <li>
              <strong>dependencies:</strong> 声明依赖的字段路径
            </li>
            <li>
              <strong>fulfill:</strong> 当依赖字段变化时执行的动作
            </li>
            <li>
              <strong>$deps:</strong> 访问依赖字段的值
            </li>
            <li>
              <strong>$self:</strong> 访问当前字段
            </li>
          </ul>

          <h4 style={{ marginTop: 16 }}>使用优势：</h4>
          <ul>
            <li>配置化：通过 JSON 配置生成表单，便于维护和动态生成</li>
            <li>服务端驱动：Schema 可以由服务端返回，实现完全动态化</li>
            <li>复用性：Schema 可以在不同项目间复用</li>
            <li>可视化：可以基于 Schema 开发可视化表单设计器</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default JsonSchemaDemo
