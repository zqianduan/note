import React, { useState } from 'react'
import {
  createForm,
  onFieldValueChange,
  onFieldReact,
  onFieldInit,
  onFormSubmit,
  onFormValidateStart,
  onFormValidateSuccess,
  onFormValidateFailed,
} from '@formily/core'
import { FormProvider, createSchemaField, FormConsumer } from '@formily/react'
import {
  FormItem,
  Input,
  Select,
  NumberPicker,
  Switch,
  Radio,
  Password,
  FormTab,
  FormLayout,
} from '@formily/antd'
import { Card, Button, Alert, Timeline, Statistic, Row, Col, Progress, Space } from 'antd'
import { ISchema } from '@formily/json-schema'

/**
 * Effects 机制深度演示
 *
 * 本示例展示了 @formily/core 中 Effects 副作用机制的各种用法：
 * 1. 生命周期 Hooks（onFieldInit、onFieldValueChange等）
 * 2. 响应式联动（onFieldReact）
 * 3. 表单级 Effects（onFormSubmit、onFormValidate等）
 * 4. 异步操作和防抖
 * 5. 动态字段控制
 * 6. 联合校验
 */

// 创建 SchemaField 组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    NumberPicker,
    Switch,
    Radio,
    Password,
    FormTab,
    FormLayout,
    Progress,
    Space,
  },
})

// 模拟 API
const mockAPI = {
  // 检查用户名是否存在
  checkUsername: (username: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟已存在的用户名
        const existingUsers = ['admin', 'test', 'user']
        resolve(existingUsers.includes(username.toLowerCase()))
      }, 500)
    })
  },

  // 获取城市列表
  getCities: (province: string): Promise<Array<{ label: string; value: string }>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cityMap: Record<string, Array<{ label: string; value: string }>> = {
          beijing: [
            { label: '朝阳区', value: 'chaoyang' },
            { label: '海淀区', value: 'haidian' },
            { label: '西城区', value: 'xicheng' },
          ],
          shanghai: [
            { label: '浦东新区', value: 'pudong' },
            { label: '徐汇区', value: 'xuhui' },
            { label: '静安区', value: 'jingan' },
          ],
          guangdong: [
            { label: '广州市', value: 'guangzhou' },
            { label: '深圳市', value: 'shenzhen' },
            { label: '珠海市', value: 'zhuhai' },
          ],
        }
        resolve(cityMap[province] || [])
      }, 300)
    })
  },
}

// 创建表单实例
const form = createForm({
  initialValues: {
    userType: 'personal',
    province: 'beijing',
    agreeTerm: false,
  },

  effects() {
    // ========== 生命周期 Hooks ==========

    // 1. 字段初始化时触发
    onFieldInit('username', (field) => {
      console.log('[onFieldInit] username 字段初始化')
      field.setData('initTime', new Date().toLocaleTimeString())
    })

    // 2. 用户名实时校验（异步 + 防抖）
    onFieldValueChange('username', async (field) => {
      if (!field.value) {
        field.clearErrors()
        return
      }

      console.log('[onFieldValueChange] username 变化:', field.value)

      // 防抖处理
      clearTimeout(field.data.checkTimer)
      field.data.checkTimer = setTimeout(async () => {
        field.setLoading(true)
        try {
          const exists = await mockAPI.checkUsername(field.value)
          if (exists) {
            field.setErrors(['用户名已存在，请更换'])
          } else {
            field.clearErrors()
            field.setWarnings([`用户名 "${field.value}" 可用`])
          }
        } finally {
          field.setLoading(false)
        }
      }, 500)
    })

    // 3. 密码强度检测
    onFieldValueChange('password', (field) => {
      const password = field.value || ''
      let strength = 0

      // 计算强度
      if (password.length >= 6) strength += 25
      if (/[a-z]/.test(password)) strength += 25
      if (/[A-Z]/.test(password)) strength += 25
      if (/[0-9]/.test(password)) strength += 25

      console.log('[onFieldValueChange] password 强度:', strength)

      // 更新密码强度字段
      field.form.setFieldState('passwordStrength', (state) => {
        state.value = strength
        state.componentProps = {
          ...state.componentProps,
          percent: strength,
          status: strength >= 75 ? 'success' : strength >= 50 ? 'normal' : 'exception',
        }
      })

      // 触发确认密码的重新校验
      field.form.query('confirmPassword').take()?.validate()
    })

    // 4. 确认密码校验（使用 onFieldReact 自动追踪依赖）
    onFieldReact('confirmPassword', (field) => {
      // onFieldReact 会自动追踪 query 的依赖
      const password = field.query('.password').value()

      console.log('[onFieldReact] confirmPassword 联动校验')

      if (field.value && password !== field.value) {
        field.setErrors(['两次密码输入不一致'])
      } else {
        field.clearErrors()
      }
    })

    // 5. 用户类型切换时的动态字段控制
    onFieldValueChange('userType', (field) => {
      const userType = field.value

      console.log('[onFieldValueChange] userType 变化:', userType)

      if (userType === 'personal') {
        // 个人用户：显示身份证，隐藏企业信息
        field.form.setFieldState('idCard', (state) => {
          state.visible = true
          state.required = true
        })
        field.form.setFieldState('companyName', (state) => {
          state.visible = false
          state.value = undefined
        })
        field.form.setFieldState('businessLicense', (state) => {
          state.visible = false
          state.value = undefined
        })
      } else {
        // 企业用户：显示企业信息，隐藏身份证
        field.form.setFieldState('idCard', (state) => {
          state.visible = false
          state.value = undefined
        })
        field.form.setFieldState('companyName', (state) => {
          state.visible = true
          state.required = true
        })
        field.form.setFieldState('businessLicense', (state) => {
          state.visible = true
          state.required = true
        })
      }
    })

    // 6. 省市级联（异步加载）
    onFieldValueChange('province', async (field) => {
      const province = field.value

      console.log('[onFieldValueChange] province 变化:', province)

      // 清空城市
      field.form.setFieldState('city', (state) => {
        state.value = undefined
        state.loading = true
      })

      // 加载城市数据
      try {
        const cities = await mockAPI.getCities(province)
        field.form.setFieldState('city', (state) => {
          state.dataSource = cities
        })
      } finally {
        field.form.setFieldState('city', (state) => {
          state.loading = false
        })
      }
    })

    // 7. 手机号和邮箱二选一
    onFieldValueChange('phone', (field) => {
      const email = field.form.values.email

      if (field.value) {
        // 填了手机号，邮箱变为非必填
        field.form.setFieldState('email', (state) => {
          state.required = false
        })
      } else if (!email) {
        // 都没填，邮箱变为必填
        field.form.setFieldState('email', (state) => {
          state.required = true
        })
      }
    })

    onFieldValueChange('email', (field) => {
      const phone = field.form.values.phone

      if (field.value) {
        field.form.setFieldState('phone', (state) => {
          state.required = false
        })
      } else if (!phone) {
        field.form.setFieldState('phone', (state) => {
          state.required = true
        })
      }
    })

    // ========== 表单级 Effects ==========

    // 8. 表单校验生命周期
    onFormValidateStart((form) => {
      console.log('[onFormValidateStart] 开始校验')
    })

    onFormValidateSuccess((form) => {
      console.log('[onFormValidateSuccess] 校验成功')
    })

    onFormValidateFailed((form) => {
      console.log('[onFormValidateFailed] 校验失败:', form.errors)
    })

    // 9. 表单提交
    onFormSubmit((form) => {
      console.log('[onFormSubmit] 表单提交:', form.values)

      // 检查是否同意协议
      if (!form.values.agreeTerm) {
        throw new Error('请先同意用户协议')
      }
    })
  },
})

// Schema 定义
const schema: ISchema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'void',
      'x-component': 'FormTab',
      properties: {
        // Tab 1: 账号信息
        accountTab: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '账号信息',
            key: '1',
          },
          properties: {
            layout1: {
              type: 'void',
              'x-component': 'FormLayout',
              'x-component-props': {
                labelCol: 6,
                wrapperCol: 16,
              },
              properties: {
                username: {
                  type: 'string',
                  title: '用户名',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入用户名（会实时检查是否重复）',
                  },
                  'x-validator': [
                    {
                      required: true,
                      message: '请输入用户名',
                    },
                    {
                      min: 3,
                      max: 20,
                      message: '用户名长度为 3-20 个字符',
                    },
                    {
                      pattern: '^[a-zA-Z0-9_]+$',
                      message: '只能包含字母、数字和下划线',
                    },
                  ],
                },
                password: {
                  type: 'string',
                  title: '密码',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Password',
                  'x-component-props': {
                    placeholder: '请输入密码',
                    checkStrength: true,
                  },
                  'x-validator': [
                    {
                      required: true,
                      message: '请输入密码',
                    },
                    {
                      min: 6,
                      message: '密码长度不能少于 6 位',
                    },
                  ],
                },
                passwordStrength: {
                  type: 'number',
                  title: '密码强度',
                  'x-decorator': 'FormItem',
                  'x-component': 'Progress',
                  'x-component-props': {
                    percent: 0,
                    status: 'exception',
                  },
                },
                confirmPassword: {
                  type: 'string',
                  title: '确认密码',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Password',
                  'x-component-props': {
                    placeholder: '请再次输入密码',
                  },
                  'x-validator': [
                    {
                      required: true,
                      message: '请确认密码',
                    },
                  ],
                },
              },
            },
          },
        },

        // Tab 2: 基本信息
        basicInfoTab: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '基本信息',
            key: '2',
          },
          properties: {
            layout2: {
              type: 'void',
              'x-component': 'FormLayout',
              'x-component-props': {
                labelCol: 6,
                wrapperCol: 16,
              },
              properties: {
                userType: {
                  type: 'string',
                  title: '用户类型',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  'x-component-props': {
                    optionType: 'button',
                  },
                  enum: [
                    { label: '个人用户', value: 'personal' },
                    { label: '企业用户', value: 'enterprise' },
                  ],
                  default: 'personal',
                },
                idCard: {
                  type: 'string',
                  title: '身份证号',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入身份证号',
                  },
                  'x-validator': [
                    {
                      pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
                      message: '请输入有效的身份证号',
                    },
                  ],
                },
                companyName: {
                  type: 'string',
                  title: '企业名称',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入企业名称',
                  },
                  'x-visible': false,
                },
                businessLicense: {
                  type: 'string',
                  title: '营业执照号',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入营业执照号',
                  },
                  'x-visible': false,
                },
              },
            },
          },
        },

        // Tab 3: 联系方式
        contactTab: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            tab: '联系方式',
            key: '3',
          },
          properties: {
            layout3: {
              type: 'void',
              'x-component': 'FormLayout',
              'x-component-props': {
                labelCol: 6,
                wrapperCol: 16,
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
                    placeholder: '请先选择省份',
                  },
                },
                phone: {
                  type: 'string',
                  title: '手机号',
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入手机号（与邮箱二选一）',
                  },
                  'x-validator': [
                    {
                      pattern: '^1[3-9]\\d{9}$',
                      message: '请输入有效的手机号',
                    },
                  ],
                },
                email: {
                  type: 'string',
                  title: '邮箱',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: '请输入邮箱（与手机号二选一）',
                  },
                  'x-validator': [
                    {
                      format: 'email',
                      message: '请输入有效的邮箱地址',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    agreeTerm: {
      type: 'boolean',
      title: '我已阅读并同意用户协议',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
      'x-validator': [
        {
          validator: (value: boolean) => {
            if (!value) {
              return '请先同意用户协议'
            }
          },
        },
      ],
    },
  },
}

const EffectsDemo: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [stats, setStats] = useState({
    validateCount: 0,
    submitCount: 0,
    changeCount: 0,
  })

  // 拦截 console.log 记录日志
  React.useEffect(() => {
    const originalLog = console.log
    console.log = (...args: any[]) => {
      originalLog(...args)
      const message = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ')
      if (message.startsWith('[')) {
        setLogs((prev) => [...prev.slice(-19), `${new Date().toLocaleTimeString()} ${message}`])

        // 更新统计
        if (message.includes('Validate')) {
          setStats((prev) => ({ ...prev, validateCount: prev.validateCount + 1 }))
        } else if (message.includes('Submit')) {
          setStats((prev) => ({ ...prev, submitCount: prev.submitCount + 1 }))
        } else if (message.includes('ValueChange')) {
          setStats((prev) => ({ ...prev, changeCount: prev.changeCount + 1 }))
        }
      }
    }

    return () => {
      console.log = originalLog
    }
  }, [])

  const handleSubmit = () => {
    form
      .submit((values) => {
        alert('注册成功！查看控制台获取完整数据')
        console.log('注册成功，表单数据:', values)
      })
      .catch((errors) => {
        console.error('校验失败:', errors)
        alert(`校验失败！共 ${errors.length} 个错误`)
      })
  }

  const handleReset = () => {
    form.reset()
    setLogs([])
    setStats({ validateCount: 0, submitCount: 0, changeCount: 0 })
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  return (
    <div className="demo-card">
      <h2 className="demo-card-title">11. Effects 副作用机制深度演示</h2>
      <p className="demo-card-description">
        展示 @formily/core 中 Effects 机制的各种用法：生命周期 Hooks、响应式联动、异步操作、动态字段控制等。
      </p>

      <Alert
        message="Effects 功能演示"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ 用户名实时校验（异步 + 防抖）</li>
            <li>✅ 密码强度实时检测</li>
            <li>✅ 确认密码联动校验（onFieldReact 自动依赖追踪）</li>
            <li>✅ 用户类型切换动态显示字段</li>
            <li>✅ 省市级联异步加载</li>
            <li>✅ 手机号和邮箱二选一校验</li>
            <li>✅ 完整的表单生命周期 Hooks</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 统计信息 */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="字段变化次数" value={stats.changeCount} />
          </Col>
          <Col span={8}>
            <Statistic title="校验次数" value={stats.validateCount} />
          </Col>
          <Col span={8}>
            <Statistic title="提交次数" value={stats.submitCount} />
          </Col>
        </Row>
      </Card>

      <FormProvider form={form}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 表单内容 */}
          <SchemaField schema={schema} />

          {/* 操作按钮 */}
          <FormItem>
            <Space>
              <Button type="primary" size="large" onClick={handleSubmit}>
                提交注册
              </Button>
              <Button size="large" onClick={handleReset}>
                重置表单
              </Button>
            </Space>
          </FormItem>

          {/* Effects 日志 */}
          <Card
            title="Effects 执行日志（实时）"
            size="small"
            extra={
              <Button size="small" onClick={handleClearLogs}>
                清空日志
              </Button>
            }
          >
            <Timeline>
              {logs.length === 0 ? (
                <Timeline.Item color="gray">暂无日志，请开始填写表单...</Timeline.Item>
              ) : (
                logs.map((log, index) => {
                  let color = 'blue'
                  if (log.includes('Error') || log.includes('Failed')) color = 'red'
                  if (log.includes('Success')) color = 'green'
                  if (log.includes('Init') || log.includes('Mount')) color = 'gray'

                  return (
                    <Timeline.Item key={index} color={color}>
                      <code style={{ fontSize: 12 }}>{log}</code>
                    </Timeline.Item>
                  )
                })
              )}
            </Timeline>
          </Card>

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

export default EffectsDemo
