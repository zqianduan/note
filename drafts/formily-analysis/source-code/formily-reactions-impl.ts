/**
 * 精简版 Formily x-reactions 实现
 *
 * 这是一个完整可运行的实现，演示了 Formily x-reactions 的核心机制
 *
 * 特性：
 * ✅ 基于 Proxy 的响应式系统
 * ✅ 自动依赖收集和追踪
 * ✅ 支持被动和主动联动
 * ✅ 支持条件判断和状态更新
 * ✅ 精准的最小粒度更新
 *
 * 使用方式：
 * ```bash
 * # 使用 ts-node 运行
 * npx ts-node formily-reactions-impl.ts
 *
 * # 或者使用 Node.js（需要先编译）
 * tsc formily-reactions-impl.ts && node formily-reactions-impl.js
 * ```
 */

// ============================================
// 1. 响应式系统核心实现
// ============================================

type Reaction = () => void

/**
 * 响应式系统
 *
 * 核心原理：
 * 1. 使用 Proxy 劫持对象的读写操作
 * 2. 在 get 时收集依赖（track）
 * 3. 在 set 时触发更新（trigger）
 * 4. 通过 WeakMap 存储依赖关系
 */
class ReactiveSystem {
  // 当前正在执行的 reaction
  private currentReaction: Reaction | null = null

  // 依赖映射表：target -> property -> reactions
  private dependencyMap = new WeakMap<any, Map<PropertyKey, Set<Reaction>>>()

  /**
   * 创建响应式对象
   *
   * @param target 要变成响应式的对象
   * @returns 响应式代理对象
   */
  observable<T extends object>(target: T): T {
    const self = this

    return new Proxy(target, {
      get(obj, key) {
        // 依赖收集
        self.track(obj, key)

        const value = Reflect.get(obj, key)

        // 深层响应式：如果属性值是对象，递归创建响应式
        if (value !== null && typeof value === 'object') {
          return self.observable(value)
        }

        return value
      },

      set(obj, key, value) {
        const oldValue = Reflect.get(obj, key)
        const result = Reflect.set(obj, key, value)

        // 只有在值真正改变时才触发更新
        if (oldValue !== value) {
          self.trigger(obj, key)
        }

        return result
      }
    })
  }

  /**
   * 依赖收集
   *
   * 在属性被读取时，将当前 reaction 添加到该属性的依赖集合中
   */
  private track(target: any, key: PropertyKey) {
    if (!this.currentReaction) return

    // 获取或创建 target 的依赖映射
    let depsMap = this.dependencyMap.get(target)
    if (!depsMap) {
      depsMap = new Map()
      this.dependencyMap.set(target, depsMap)
    }

    // 获取或创建 property 的依赖集合
    let deps = depsMap.get(key)
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }

    // 添加当前 reaction 到依赖集合
    deps.add(this.currentReaction)
  }

  /**
   * 触发更新
   *
   * 在属性被修改时，执行所有依赖该属性的 reaction
   */
  private trigger(target: any, key: PropertyKey) {
    const depsMap = this.dependencyMap.get(target)
    if (!depsMap) return

    const deps = depsMap.get(key)
    if (!deps) return

    // 执行所有依赖的 reaction
    deps.forEach(reaction => reaction())
  }

  /**
   * 创建 reaction
   *
   * @param tracker 追踪函数，用于收集依赖
   * @param effect 副作用函数，当依赖变化时执行
   * @returns 清理函数
   */
  reaction(tracker: () => any, effect: (value: any) => void) {
    const wrappedEffect = () => {
      this.currentReaction = wrappedEffect
      try {
        const value = tracker()
        effect(value)
      } finally {
        this.currentReaction = null
      }
    }

    // 立即执行一次
    wrappedEffect()

    // 返回清理函数
    return () => {
      this.currentReaction = null
    }
  }
}

// 创建全局单例
const reactiveSystem = new ReactiveSystem()

// ============================================
// 2. 字段模型
// ============================================

/**
 * 字段状态接口
 */
interface IFieldState {
  value?: any
  visible?: boolean
  disabled?: boolean
  required?: boolean
  errors?: string[]
  [key: string]: any
}

/**
 * 字段类
 *
 * 代表表单中的一个字段，包含：
 * - 字段路径
 * - 字段状态（value, visible, disabled 等）
 * - 所属表单的引用
 * - reactions 清理函数
 */
class Field {
  public path: string
  public state: IFieldState
  public form: Form
  private reactions: Array<() => void> = []

  constructor(path: string, form: Form, initialState: IFieldState = {}) {
    this.path = path
    this.form = form

    // 创建响应式状态
    this.state = reactiveSystem.observable({
      value: undefined,
      visible: true,
      disabled: false,
      required: false,
      errors: [],
      ...initialState
    })
  }

  /**
   * 更新状态
   */
  setState(updater: (state: IFieldState) => void) {
    updater(this.state)
  }

  /**
   * 获取字段值
   */
  get value() {
    return this.state.value
  }

  /**
   * 设置字段值
   */
  set value(val: any) {
    this.state.value = val
  }

  /**
   * 添加 reaction 清理函数
   */
  addReaction(dispose: () => void) {
    this.reactions.push(dispose)
  }

  /**
   * 清理所有 reactions
   */
  dispose() {
    this.reactions.forEach(dispose => dispose())
    this.reactions = []
  }
}

// ============================================
// 3. 表单模型
// ============================================

/**
 * 表单类
 *
 * 管理整个表单的：
 * - 字段注册和生命周期
 * - 表单级别的状态
 * - 字段查询
 */
class Form {
  public fields = new Map<string, Field>()

  /**
   * 注册字段
   */
  registerField(path: string, initialState?: IFieldState): Field {
    // 如果字段已存在，直接返回
    if (this.fields.has(path)) {
      return this.fields.get(path)!
    }

    const field = new Field(path, this, initialState)
    this.fields.set(path, field)
    return field
  }

  /**
   * 获取字段
   */
  getField(path: string): Field | undefined {
    return this.fields.get(path)
  }

  /**
   * 获取所有字段的值
   */
  get values() {
    const values: Record<string, any> = {}
    this.fields.forEach((field, path) => {
      values[path] = field.value
    })
    return values
  }

  /**
   * 批量设置字段值
   */
  setValues(values: Record<string, any>) {
    Object.keys(values).forEach(path => {
      const field = this.getField(path)
      if (field) {
        field.value = values[path]
      }
    })
  }

  /**
   * 重置表单
   */
  reset() {
    this.fields.forEach(field => {
      field.value = undefined
    })
  }
}

// ============================================
// 4. Reactions 配置接口
// ============================================

/**
 * 依赖配置
 */
interface IReactionDependency {
  name: string
  type?: 'value' | 'visible' | 'disabled' | 'errors'
}

/**
 * Fulfill 配置
 */
interface IReactionFulfill {
  state?: Partial<IFieldState>
  run?: (context: IReactionContext) => void
}

/**
 * Reaction 配置
 */
interface IReactionConfig {
  // 依赖字段列表
  dependencies?: Array<string | IReactionDependency>

  // 联动条件
  when?: string | ((context: IReactionContext) => boolean)

  // 目标字段（主动联动）
  target?: string

  // 条件满足时执行
  fulfill?: IReactionFulfill

  // 条件不满足时执行
  otherwise?: IReactionFulfill
}

/**
 * Reaction 上下文
 */
interface IReactionContext {
  $self: Field        // 当前字段
  $form: Form         // 表单实例
  $deps: any[]        // 依赖字段的值
  $target?: Field     // 目标字段
}

// ============================================
// 5. Reactions 引擎
// ============================================

/**
 * Reactions 引擎
 *
 * 负责：
 * 1. 解析 reaction 配置
 * 2. 创建响应式追踪
 * 3. 评估条件
 * 4. 执行状态更新
 */
class ReactionsEngine {
  /**
   * 应用 reactions 到字段
   *
   * @param field 目标字段
   * @param reactions 单个或多个 reaction 配置
   */
  applyReactions(
    field: Field,
    reactions: IReactionConfig | IReactionConfig[]
  ) {
    const reactionList = Array.isArray(reactions) ? reactions : [reactions]

    reactionList.forEach(config => {
      const dispose = this.createReaction(field, config)
      field.addReaction(dispose)
    })
  }

  /**
   * 创建单个 reaction
   */
  private createReaction(field: Field, config: IReactionConfig) {
    // 1. 解析依赖字段
    const depFields = this.resolveDependencies(field, config.dependencies)

    // 2. 解析目标字段
    const targetField = config.target
      ? field.form.getField(config.target)
      : field

    if (!targetField) {
      console.warn(`Target field not found: ${config.target}`)
      return () => {}
    }

    // 3. 创建响应式追踪
    return reactiveSystem.reaction(
      // tracker: 收集依赖
      () => {
        // 访问依赖字段的值，触发依赖收集
        return depFields.map(dep => dep.value)
      },

      // effect: 依赖变化时执行
      (depsValues) => {
        // 构建上下文
        const context: IReactionContext = {
          $self: field,
          $form: field.form,
          $deps: depsValues,
          $target: targetField
        }

        // 评估条件
        const condition = this.evaluateCondition(config.when, context)

        // 执行 fulfill 或 otherwise
        const fulfill = condition ? config.fulfill : config.otherwise
        if (fulfill) {
          this.executeFulfill(targetField, fulfill, context)
        }
      }
    )
  }

  /**
   * 解析依赖字段
   */
  private resolveDependencies(
    field: Field,
    dependencies?: Array<string | IReactionDependency>
  ): Field[] {
    if (!dependencies || dependencies.length === 0) return []

    return dependencies
      .map(dep => {
        const path = typeof dep === 'string' ? dep : dep.name
        return field.form.getField(path)
      })
      .filter(Boolean) as Field[]
  }

  /**
   * 评估条件
   */
  private evaluateCondition(
    when: string | Function | undefined,
    context: IReactionContext
  ): boolean {
    if (!when) return true

    if (typeof when === 'function') {
      return when(context)
    }

    if (typeof when === 'string') {
      return this.evalExpression(when, context)
    }

    return true
  }

  /**
   * 执行 fulfill
   */
  private executeFulfill(
    field: Field,
    fulfill: IReactionFulfill,
    context: IReactionContext
  ) {
    // 更新状态
    if (fulfill.state) {
      Object.keys(fulfill.state).forEach(key => {
        const value = fulfill.state![key]
        field.state[key] = value
      })
    }

    // 执行自定义逻辑
    if (fulfill.run) {
      fulfill.run(context)
    }
  }

  /**
   * 表达式求值（简化版）
   *
   * 注意：生产环境应使用更安全的表达式引擎
   */
  private evalExpression(expr: string, context: any): any {
    try {
      // 去除模板字符串标记 {{ }}
      const code = expr.replace(/^\{\{|\}\}$/g, '').trim()

      // 创建函数并执行
      const fn = new Function(
        ...Object.keys(context),
        `return ${code}`
      )

      return fn(...Object.values(context))
    } catch (error) {
      console.error('Expression evaluation error:', expr, error)
      return false
    }
  }
}

// ============================================
// 6. 使用示例
// ============================================

function runExamples() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║   Formily x-reactions 精简版实现 - 示例演示           ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log()

  const form = new Form()
  const engine = new ReactionsEngine()

  // ============================================
  // 示例 1: 字段显隐控制（被动联动）
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 示例 1: 字段显隐控制（被动联动）    │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const countryField = form.registerField('country')
  const provinceField = form.registerField('province')

  // 当 country 为 'CN' 时显示 province，否则隐藏
  engine.applyReactions(provinceField, {
    dependencies: ['country'],
    when: (ctx) => ctx.$deps[0] === 'CN',
    fulfill: {
      state: { visible: true }
    },
    otherwise: {
      state: { visible: false }
    }
  })

  console.log('初始状态:')
  console.log(`  country.value: ${countryField.value}`)
  console.log(`  province.visible: ${provinceField.state.visible}`)
  console.log()

  countryField.value = 'US'
  console.log('设置 country = "US":')
  console.log(`  country.value: ${countryField.value}`)
  console.log(`  province.visible: ${provinceField.state.visible}`)
  console.log()

  countryField.value = 'CN'
  console.log('设置 country = "CN":')
  console.log(`  country.value: ${countryField.value}`)
  console.log(`  province.visible: ${provinceField.state.visible}`)
  console.log()

  // ============================================
  // 示例 2: 值计算联动
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 示例 2: 值计算联动                  │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const priceField = form.registerField('price')
  const quantityField = form.registerField('quantity')
  const totalField = form.registerField('total')

  // total = price * quantity
  engine.applyReactions(totalField, {
    dependencies: ['price', 'quantity'],
    fulfill: {
      run: (ctx) => {
        const [price, quantity] = ctx.$deps
        ctx.$self.value = (price || 0) * (quantity || 0)
      }
    }
  })

  priceField.value = 100
  quantityField.value = 5
  console.log('设置 price = 100, quantity = 5:')
  console.log(`  total: ${totalField.value}`)
  console.log()

  priceField.value = 200
  console.log('设置 price = 200:')
  console.log(`  total: ${totalField.value}`)
  console.log()

  quantityField.value = 10
  console.log('设置 quantity = 10:')
  console.log(`  total: ${totalField.value}`)
  console.log()

  // ============================================
  // 示例 3: 主动联动
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 示例 3: 主动联动                    │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const discountField = form.registerField('discount')
  const finalPriceField = form.registerField('finalPrice')

  // 当 discount 大于 0 时，更新 finalPrice
  engine.applyReactions(discountField, {
    dependencies: ['price', 'discount'],
    when: (ctx) => ctx.$deps[1] > 0,
    target: 'finalPrice',
    fulfill: {
      run: (ctx) => {
        const [price, discount] = ctx.$deps
        ctx.$target!.value = price * (1 - discount / 100)
      }
    }
  })

  priceField.value = 1000
  discountField.value = 0
  console.log('设置 price = 1000, discount = 0:')
  console.log(`  finalPrice: ${finalPriceField.value}`)
  console.log()

  discountField.value = 20
  console.log('设置 discount = 20:')
  console.log(`  finalPrice: ${finalPriceField.value}`)
  console.log()

  discountField.value = 50
  console.log('设置 discount = 50:')
  console.log(`  finalPrice: ${finalPriceField.value}`)
  console.log()

  // ============================================
  // 示例 4: 表达式联动
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 示例 4: 表达式联动                  │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const ageField = form.registerField('age')
  const categoryField = form.registerField('category')

  // 根据年龄自动设置分类
  engine.applyReactions(categoryField, {
    dependencies: ['age'],
    fulfill: {
      run: (ctx) => {
        const age = ctx.$deps[0]
        if (age < 18) {
          ctx.$self.value = '未成年'
        } else if (age < 60) {
          ctx.$self.value = '成年'
        } else {
          ctx.$self.value = '老年'
        }
      }
    }
  })

  ageField.value = 15
  console.log('设置 age = 15:')
  console.log(`  category: ${categoryField.value}`)
  console.log()

  ageField.value = 30
  console.log('设置 age = 30:')
  console.log(`  category: ${categoryField.value}`)
  console.log()

  ageField.value = 65
  console.log('设置 age = 65:')
  console.log(`  category: ${categoryField.value}`)
  console.log()

  // ============================================
  // 示例 5: 多依赖联动
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 示例 5: 多依赖联动                  │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const usernameField = form.registerField('username')
  const passwordField = form.registerField('password')
  const submitButton = form.registerField('submitButton')

  // 只有当用户名和密码都填写时才启用提交按钮
  engine.applyReactions(submitButton, {
    dependencies: ['username', 'password'],
    when: (ctx) => {
      const [username, password] = ctx.$deps
      return username && password && username.length > 0 && password.length > 0
    },
    fulfill: {
      state: { disabled: false }
    },
    otherwise: {
      state: { disabled: true }
    }
  })

  console.log('初始状态:')
  console.log(`  submitButton.disabled: ${submitButton.state.disabled}`)
  console.log()

  usernameField.value = 'admin'
  console.log('设置 username = "admin":')
  console.log(`  submitButton.disabled: ${submitButton.state.disabled}`)
  console.log()

  passwordField.value = '123456'
  console.log('设置 password = "123456":')
  console.log(`  submitButton.disabled: ${submitButton.state.disabled}`)
  console.log()

  usernameField.value = ''
  console.log('清空 username:')
  console.log(`  submitButton.disabled: ${submitButton.state.disabled}`)
  console.log()

  // ============================================
  // 性能测试
  // ============================================
  console.log('┌─────────────────────────────────────┐')
  console.log('│ 性能测试: 1000 次更新               │')
  console.log('└─────────────────────────────────────┘')
  console.log()

  const startTime = Date.now()
  for (let i = 0; i < 1000; i++) {
    priceField.value = i
  }
  const endTime = Date.now()

  console.log(`✅ 完成 1000 次字段更新`)
  console.log(`⏱️  耗时: ${endTime - startTime}ms`)
  console.log(`📊 平均: ${((endTime - startTime) / 1000).toFixed(3)}ms/次`)
  console.log()

  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║   演示完成 ✨                                          ║')
  console.log('╚════════════════════════════════════════════════════════╝')
}

// ============================================
// 7. 导出
// ============================================

export {
  ReactiveSystem,
  Field,
  Form,
  ReactionsEngine,
  reactiveSystem,
  type IReactionConfig,
  type IReactionContext,
  type IFieldState,
  type IReactionDependency,
  type IReactionFulfill
}

// 运行示例（如果直接执行此文件）
if (require.main === module) {
  runExamples()
}
