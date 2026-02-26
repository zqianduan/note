import React, { useState } from 'react'
import { createForm } from '@formily/core'
import { FormProvider, createSchemaField, FormConsumer } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  NumberPicker,
  DatePicker,
  Switch,
  Radio,
  FormTab,
  FormGrid,
  ArrayItems,
  FormLayout,
  Space,
} from '@formily/antd'
import { Card, Button, Alert, Statistic, Row, Col, Timeline } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * 综合示例 - 电商订单管理表单（JSON Schema 模式）
 *
 * 本示例综合展示：
 * 1. 使用 JSON Schema 定义复杂表单结构
 * 2. x-reactions 实现复杂字段联动
 * 3. 多级嵌套结构（FormTab + ObjectField + ArrayField）
 * 4. 动态计算（商品小计、总金额、优惠金额）
 * 5. 条件显示（根据订单类型显示不同字段）
 * 6. 实时订单汇总统计
 *
 * 业务场景：
 * 一个完整的电商订单表单，包括：
 * - 订单基本信息
 * - 收货地址信息
 * - 商品列表（支持添加多个商品）
 * - 优惠券和折扣
 * - 支付方式选择
 * - 发票信息
 */

// 创建 SchemaField 组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    NumberPicker,
    DatePicker,
    Switch,
    Radio,
    FormTab,
    FormGrid,
    ArrayItems,
    FormLayout,
    Space,
    Card,
  },
})

// 模拟商品数据库
const mockProducts = [
  { id: 'p1', name: 'iPhone 14 Pro', price: 7999, stock: 50, category: 'electronics' },
  { id: 'p2', name: 'MacBook Pro', price: 12999, stock: 30, category: 'electronics' },
  { id: 'p3', name: 'AirPods Pro', price: 1999, stock: 100, category: 'electronics' },
  { id: 'p4', name: 'Nike运动鞋', price: 899, stock: 200, category: 'clothing' },
  { id: 'p5', name: 'Adidas外套', price: 599, stock: 150, category: 'clothing' },
]

// 模拟优惠券数据
const mockCoupons = [
  { id: 'c1', name: '满1000减100', minAmount: 1000, discount: 100, type: 'fixed' },
  { id: 'c2', name: '9折优惠券', minAmount: 500, discount: 0.9, type: 'percent' },
  { id: 'c3', name: '满5000减500', minAmount: 5000, discount: 500, type: 'fixed' },
]

// ========== 完整的订单表单 Schema ==========
const orderFormSchema: ISchema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'void',
      'x-component': 'FormTab',
      properties: {
        // ========== Tab 1: 基本信息 ==========
        basicInfo: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '基本信息',
            key: '1',
          },
          properties: {
            card1: {
              type: 'void',
              'x-component': 'Card',
              properties: {
                orderType: {
                  type: 'string',
                  title: '订单类型',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  'x-component-props': {
                    optionType: 'button',
                  },
                  enum: [
                    { label: '线上订单', value: 'online' },
                    { label: '门店自提', value: 'pickup' },
                  ],
                  default: 'online',
                },
                customerName: {
                  type: 'string',
                  title: '客户姓名',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入客户姓名',
                  },
                },
                customerPhone: {
                  type: 'string',
                  title: '联系电话',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入联系电话',
                  },
                  'x-validator': [
                    {
                      pattern: '^1[3-9]\\d{9}$',
                      message: '请输入有效的手机号',
                    },
                  ],
                },
                orderDate: {
                  type: 'string',
                  title: '下单时间',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    showTime: true,
                    style: { width: '100%' },
                  },
                },
              },
            },
          },
        },

        // ========== Tab 2: 收货信息 ==========
        shippingInfo: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '收货信息',
            key: '2',
          },
          properties: {
            card2: {
              type: 'void',
              'x-component': 'Card',
              properties: {
                // 线上订单显示配送地址
                shippingAddress: {
                  type: 'object',
                  'x-reactions': {
                    dependencies: ['.orderType'],
                    fulfill: {
                      state: {
                        visible: "{{$deps[0] === 'online'}}",
                      },
                    },
                  },
                  properties: {
                    province: {
                      type: 'string',
                      title: '省份',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: '请选择省份',
                      },
                      enum: [
                        { label: '北京市', value: 'beijing' },
                        { label: '上海市', value: 'shanghai' },
                        { label: '广东省', value: 'guangdong' },
                      ],
                    },
                    city: {
                      type: 'string',
                      title: '城市',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: '请选择城市',
                      },
                      enum: [
                        { label: '北京市', value: 'beijing' },
                        { label: '上海市', value: 'shanghai' },
                        { label: '广州市', value: 'guangzhou' },
                      ],
                    },
                    detail: {
                      type: 'string',
                      title: '详细地址',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input.TextArea',
                      'x-component-props': {
                        placeholder: '请输入详细地址',
                        rows: 3,
                      },
                    },
                  },
                },
                // 门店自提显示自提信息
                pickupStore: {
                  type: 'string',
                  title: '自提门店',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: '请选择自提门店',
                  },
                  enum: [
                    { label: '朝阳门店 - 北京市朝阳区', value: 'store1' },
                    { label: '海淀门店 - 北京市海淀区', value: 'store2' },
                    { label: '西城门店 - 北京市西城区', value: 'store3' },
                  ],
                  'x-reactions': {
                    dependencies: ['.orderType'],
                    fulfill: {
                      state: {
                        visible: "{{$deps[0] === 'pickup'}}",
                      },
                    },
                  },
                },
                pickupTime: {
                  type: 'string',
                  title: '预约自提时间',
                  'x-decorator': 'FormItem',
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    showTime: true,
                    style: { width: '100%' },
                  },
                  'x-reactions': {
                    dependencies: ['.orderType'],
                    fulfill: {
                      state: {
                        visible: "{{$deps[0] === 'pickup'}}",
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // ========== Tab 3: 商品清单 ==========
        productList: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '商品清单',
            key: '3',
          },
          properties: {
            card3: {
              type: 'void',
              'x-component': 'Card',
              properties: {
                products: {
                  type: 'array',
                  'x-component': 'ArrayItems',
                  'x-decorator': 'FormItem',
                  'x-reactions': [
                    {
                      // 监听所有商品变化，计算总金额
                      when: '{{true}}',
                      fulfill: {
                        run: `{{
                          const products = $self.value || [];
                          const subtotal = products.reduce((sum, item) => sum + (item?.subtotal || 0), 0);
                          $form.setFieldState('subtotalAmount', state => {
                            state.value = subtotal;
                          });
                        }}`,
                      },
                    },
                  ],
                  items: {
                    type: 'object',
                    properties: {
                      card: {
                        type: 'void',
                        'x-component': 'Card',
                        'x-component-props': {
                          size: 'small',
                          style: { marginBottom: 16 },
                        },
                        properties: {
                          grid: {
                            type: 'void',
                            'x-component': 'FormGrid',
                            'x-component-props': {
                              maxColumns: 5,
                              columnGap: 16,
                            },
                            properties: {
                              productId: {
                                type: 'string',
                                title: '商品',
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'Select',
                                'x-component-props': {
                                  placeholder: '请选择商品',
                                  options: `{{${JSON.stringify(
                                    mockProducts.map((p) => ({
                                      label: `${p.name} - ¥${p.price}`,
                                      value: p.id,
                                    }))
                                  )}}}`,
                                },
                                'x-reactions': [
                                  {
                                    // 选择商品后，设置库存提示和计算小计
                                    dependencies: ['.quantity'],
                                    fulfill: {
                                      run: `{{
                                        const productId = $self.value;
                                        const quantity = $deps[0] || 0;
                                        const products = ${JSON.stringify(mockProducts)};

                                        if (productId) {
                                          const product = products.find(p => p.id === productId);
                                          if (product) {
                                            // 设置库存提示
                                            $form.setFieldState($self.query('.quantity').take(), state => {
                                              state.componentProps = {
                                                ...state.componentProps,
                                                max: product.stock,
                                                placeholder: \`库存: \${product.stock}\`,
                                              };
                                            });

                                            // 计算小计
                                            const subtotal = product.price * quantity;
                                            $form.setFieldState($self.query('.subtotal').take(), state => {
                                              state.value = subtotal;
                                            });
                                          }
                                        }
                                      }}`,
                                    },
                                  },
                                ],
                              },
                              quantity: {
                                type: 'number',
                                title: '数量',
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'NumberPicker',
                                'x-component-props': {
                                  min: 1,
                                  style: { width: '100%' },
                                },
                                'x-reactions': {
                                  dependencies: ['.productId'],
                                  fulfill: {
                                    run: `{{
                                      const quantity = $self.value || 0;
                                      const productId = $deps[0];
                                      const products = ${JSON.stringify(mockProducts)};

                                      if (productId) {
                                        const product = products.find(p => p.id === productId);
                                        if (product) {
                                          const subtotal = product.price * quantity;
                                          $form.setFieldState($self.query('.subtotal').take(), state => {
                                            state.value = subtotal;
                                          });
                                        }
                                      }
                                    }}`,
                                  },
                                },
                              },
                              subtotal: {
                                type: 'number',
                                title: '小计（元）',
                                'x-decorator': 'FormItem',
                                'x-component': 'NumberPicker',
                                'x-component-props': {
                                  disabled: true,
                                  style: { width: '100%' },
                                },
                              },
                              operations: {
                                type: 'void',
                                'x-component': 'Space',
                                properties: {
                                  moveUp: {
                                    type: 'void',
                                    'x-component': 'ArrayItems.MoveUp',
                                  },
                                  moveDown: {
                                    type: 'void',
                                    'x-component': 'ArrayItems.MoveDown',
                                  },
                                  remove: {
                                    type: 'void',
                                    'x-component': 'ArrayItems.Remove',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  properties: {
                    addition: {
                      type: 'void',
                      title: '添加商品',
                      'x-component': 'ArrayItems.Addition',
                    },
                  },
                },
              },
            },
          },
        },

        // ========== Tab 4: 支付方式 ==========
        paymentInfo: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '支付方式',
            key: '4',
          },
          properties: {
            card4: {
              type: 'void',
              'x-component': 'Card',
              properties: {
                subtotalAmount: {
                  type: 'number',
                  title: '商品小计',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-component-props': {
                    disabled: true,
                    precision: 2,
                    style: { width: '100%' },
                  },
                },
                couponId: {
                  type: 'string',
                  title: '优惠券',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  'x-component-props': {
                    placeholder: '请选择优惠券',
                    allowClear: true,
                    options: `{{${JSON.stringify(
                      mockCoupons.map((c) => ({
                        label: c.name,
                        value: c.id,
                      }))
                    )}}}`,
                  },
                  'x-reactions': [
                    {
                      dependencies: ['.subtotalAmount'],
                      fulfill: {
                        run: `{{
                          const couponId = $self.value;
                          const subtotal = $deps[0] || 0;
                          const coupons = ${JSON.stringify(mockCoupons)};

                          let discountAmount = 0;
                          let finalAmount = subtotal;

                          if (couponId) {
                            const coupon = coupons.find(c => c.id === couponId);
                            if (coupon && subtotal >= coupon.minAmount) {
                              if (coupon.type === 'fixed') {
                                discountAmount = coupon.discount;
                              } else {
                                discountAmount = subtotal * (1 - coupon.discount);
                              }
                              finalAmount = subtotal - discountAmount;
                            }
                          }

                          $form.setValues({
                            discountAmount,
                            finalAmount,
                          });
                        }}`,
                      },
                    },
                  ],
                },
                discountAmount: {
                  type: 'number',
                  title: '优惠金额',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-component-props': {
                    disabled: true,
                    precision: 2,
                    style: { width: '100%', color: '#cf1322' },
                  },
                  'x-reactions': {
                    dependencies: ['.subtotalAmount', '.couponId'],
                    fulfill: {
                      run: `{{
                        const subtotal = $deps[0] || 0;
                        const couponId = $deps[1];
                        const coupons = ${JSON.stringify(mockCoupons)};

                        let discountAmount = 0;
                        let finalAmount = subtotal;

                        if (couponId) {
                          const coupon = coupons.find(c => c.id === couponId);
                          if (coupon && subtotal >= coupon.minAmount) {
                            if (coupon.type === 'fixed') {
                              discountAmount = coupon.discount;
                            } else {
                              discountAmount = subtotal * (1 - coupon.discount);
                            }
                            finalAmount = subtotal - discountAmount;
                          }
                        }

                        $self.value = discountAmount;
                        $form.setFieldState('finalAmount', state => {
                          state.value = finalAmount;
                        });
                      }}`,
                    },
                  },
                },
                finalAmount: {
                  type: 'number',
                  title: '应付金额',
                  'x-decorator': 'FormItem',
                  'x-component': 'NumberPicker',
                  'x-component-props': {
                    disabled: true,
                    precision: 2,
                    style: { width: '100%', color: '#3f8600', fontWeight: 'bold' },
                  },
                },
                paymentMethod: {
                  type: 'string',
                  title: '支付方式',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  enum: [
                    { label: '支付宝', value: 'alipay' },
                    { label: '微信支付', value: 'wechat' },
                    { label: '银行卡', value: 'bank' },
                  ],
                  default: 'alipay',
                },
                needInvoice: {
                  type: 'boolean',
                  title: '需要发票',
                  'x-decorator': 'FormItem',
                  'x-component': 'Switch',
                  default: false,
                },
                invoiceInfo: {
                  type: 'object',
                  'x-reactions': {
                    dependencies: ['.needInvoice'],
                    fulfill: {
                      state: {
                        visible: '{{$deps[0]}}',
                      },
                    },
                  },
                  properties: {
                    type: {
                      type: 'string',
                      title: '发票类型',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Radio.Group',
                      enum: [
                        { label: '个人', value: 'personal' },
                        { label: '企业', value: 'enterprise' },
                      ],
                    },
                    title: {
                      type: 'string',
                      title: '发票抬头',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-component-props': {
                        placeholder: '请输入发票抬头',
                      },
                    },
                    taxNumber: {
                      type: 'string',
                      title: '税号',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-component-props': {
                        placeholder: '请输入税号',
                      },
                      'x-reactions': {
                        dependencies: ['.type'],
                        fulfill: {
                          state: {
                            required: "{{$deps[0] === 'enterprise'}}",
                            visible: "{{$deps[0] === 'enterprise'}}",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

// 创建表单实例
const form = createForm({
  initialValues: {
    orderType: 'online',
    paymentMethod: 'alipay',
    needInvoice: false,
  },
})

// 订单统计组件
const OrderSummary: React.FC = () => {
  return (
    <FormConsumer>
      {(form) => {
        const subtotal = form.values.subtotalAmount || 0
        const discount = form.values.discountAmount || 0
        const final = form.values.finalAmount || 0
        const products = form.values.products || []

        return (
          <Card title="订单汇总" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="商品件数" value={products.length} suffix="件" />
              </Col>
              <Col span={6}>
                <Statistic title="商品小计" value={subtotal} precision={2} prefix="¥" />
              </Col>
              <Col span={6}>
                <Statistic
                  title="优惠金额"
                  value={discount}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="应付金额"
                  value={final}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
          </Card>
        )
      }}
    </FormConsumer>
  )
}

const ComplexFormDemo: React.FC = () => {
  const [submitLog, setSubmitLog] = useState<string[]>([])

  const handleSubmit = () => {
    form
      .submit((values) => {
        console.log('订单数据:', values)

        const log = `提交订单成功 - 订单金额: ¥${(values as any).finalAmount?.toFixed(2) || 0}`
        setSubmitLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])

        alert('订单提交成功！查看控制台获取完整订单数据')
      })
      .catch((errors) => {
        console.log('校验错误:', errors)
        alert(`订单校验失败！\n错误数: ${errors.length}`)
      })
  }

  const handleReset = () => {
    form.reset()
    setSubmitLog([])
  }

  // 添加示例商品
  const handleAddSample = () => {
    form.setValues({
      products: [
        {
          productId: 'p1',
          quantity: 2,
          subtotal: 15998,
        },
        {
          productId: 'p3',
          quantity: 1,
          subtotal: 1999,
        },
      ],
    })
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">10. 综合示例 - 电商订单管理（JSON Schema 模式）</h2>
      <p className="demo-card-description">
        这是一个完整的电商订单表单，使用 JSON Schema 定义所有表单结构和联动逻辑。
        展示了 x-reactions 在复杂业务场景中的应用。
      </p>

      <Alert
        message="功能特性"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>使用 JSON Schema 定义整个表单结构</li>
            <li>使用 x-reactions 实现自动计算商品小计和订单总额</li>
            <li>使用 x-reactions 实现优惠券自动应用和金额计算</li>
            <li>根据订单类型动态显示配送/自提信息</li>
            <li>动态商品库存验证和提示</li>
            <li>发票信息条件显示</li>
            <li>实时订单汇总统计</li>
          </ul>
        }
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <FormProvider form={form}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 订单汇总 */}
          <OrderSummary />

          {/* 示例数据按钮 */}
          <Card size="small">
            <Space>
              <Button type="dashed" onClick={handleAddSample}>
                添加示例商品
              </Button>
            </Space>
          </Card>

          {/* 表单内容 */}
          <SchemaField schema={orderFormSchema} />

          {/* 操作按钮 */}
          <FormItem>
            <Space>
              <Button type="primary" size="large" onClick={handleSubmit}>
                提交订单
              </Button>
              <Button size="large" onClick={handleReset}>
                重置
              </Button>
            </Space>
          </FormItem>

          {/* 提交日志 */}
          {submitLog.length > 0 && (
            <Card title="提交日志" size="small">
              <Timeline>
                {submitLog.map((log, index) => (
                  <Timeline.Item key={index} color="green">
                    {log}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {/* 表单数据 */}
          <Card title="表单数据（实时）" size="small">
            <FormConsumer>
              {(form) => (
                <div className="json-preview">
                  <pre>{JSON.stringify(form.values, null, 2)}</pre>
                </div>
              )}
            </FormConsumer>
          </Card>
        </div>
      </FormProvider>
    </div>
  )
}

export default ComplexFormDemo
