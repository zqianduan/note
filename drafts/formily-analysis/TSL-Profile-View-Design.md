# WIP: TSL&Profile 重构 View 层详细设计

| 修订日期 | 迭代项目/版本号 | 修订内容 | 标注颜色 |
|---------|---------------|---------|---------|
| 2026/1/8 | 1.0.0 | 初始版本 | 无底色 |
| 2026/1/22 | 1.1.0 | 新增跨端适配方案（Web, Native），包含 Webview 方案和 React Native 方案的详细设计、对比和选型建议 | 黄色背景 |

## 1. 适用范围

研发组员、测试组员

## 2. 阅读说明（全文通用）

• **彩色背景文字** 代表修改部分（飞书只支持6种彩色背景，用完请及时回收最早使用的颜色）

• ~~中划线~~ 代表此部分删除

## 3. 术语

为沟通平滑，文中如果出现不能让新接触该模块的同学准确理解的术语，应该在此补充

| 术语 | 定义 |
|-----|-----|
| TSL | Thing Specification Language，物模型规范语言 |
| Profile | 设备配置文件，描述设备的属性、功能、事件等 |
| DCForm | Device Configuration Form，设备配置表单库 |
| Formily | 阿里巴巴开源的表单解决方案 |
| Schema | 表单的结构化描述，用JSON格式定义表单字段、类型、校验等 |
| Webview | 在 Native 应用中嵌入的 Web 浏览器组件，可运行 Web 页面 |
| React Native | Facebook 开源的跨平台移动应用开发框架，使用 JavaScript 开发原生应用 |
| Bridge | 桥接层，连接 Webview 和 Native 代码，实现相互调用 |
| 响应式设计 | 根据设备屏幕尺寸自动调整布局和样式的设计方法 |
| PWA | Progressive Web App，渐进式 Web 应用，具备类原生应用体验 |

## 4. 需求背景

### 4.1 现状分析

#### 配置维护层面

当前 TSL/Profile 的配置维护采用 **Excel 表格** 方式（物模型维护表、设备 Profile 维护表），在实际应用中暴露出严重的效率和质量问题：

**1. 维护成本高，错误率高**
- Excel 表格手工维护，单个设备配置平均包含 **50+ 字段**，涉及 **数百行** 配置数据
- 字段类型、校验规则、联动关系等配置分散在多个 sheet，信息碎片化
- 人工编辑极易出错，**错误率约 15-20%**，需要多轮测试才能发现问题
- 配置变更需要手动同步到多处，容易遗漏，导致配置不一致

**2. 表达能力受限**
- Excel 无法直观表达复杂的字段联动关系（如"省市区"三级联动、条件显示/隐藏）
- 只能通过文字描述逻辑，前端开发需要二次"翻译"为代码，理解成本高
- 无法支持动态表单场景，如根据设备型号动态生成不同表单结构

**3. 协作效率低**
- Excel 文件无法多人同时编辑，存在版本冲突
- 缺乏版本管理机制，无法追溯历史变更，出问题难以回溯
- 配置评审依赖人工对比文件，效率低下

**4. 质量保障弱**
- 缺少配置校验机制，错误只能在运行时发现
- 无法进行自动化测试，质量依赖人工检查
- 配置规范难以统一，不同人员维护的格式不一致

#### 前端实现层面

现有前端表单实现存在严重的性能和开发效率问题：

**1. 性能问题**
- **大表单全量渲染**：单个设备配置表单包含 50+ 字段，任意字段变化都会触发全表单重渲染
- **页面卡顿**：在中低端设备上，表单操作响应时间 > 500ms，用户体验差
- **内存占用高**：复杂表单内存占用可达 50MB+，移动端易崩溃

**2. 开发效率问题**
- **重复代码多**：每个设备的表单都需要手写一遍，相似代码重复率 > 60%
- **联动逻辑复杂**：命令式的联动代码难以维护，平均一个复杂联动需要 **100+ 行代码**
- **需求响应慢**：新增/修改一个设备表单平均需要 **2-3 天**
- **缺少复用**：React 和 Vue 端各自实现，代码无法复用

**3. 维护成本问题**
- **特殊设备兼容**：硬编码的兼容逻辑散落在各处，难以维护
- **Bug 修复成本高**：牵一发动全身，修改一处可能影响多处
- **技术债务累积**：历史代码难以重构，技术债务不断增加

### 4.2 业务影响

上述问题带来的业务影响：

- **研发效率低**：表单开发占项目周期的 **30-40%**，成为研发瓶颈
- **交付周期长**：新设备接入周期长，影响业务快速响应
- **质量风险高**：配置错误导致的线上问题占比 **15%**
- **用户体验差**：表单卡顿、加载慢，用户投诉率高
- **维护成本高**：每次需求变更都需要大量回归测试

### 4.3 解决方案目标

基于以上问题，本方案旨在通过构建 **基于 Formily 的统一表单底层库**，实现以下目标：

#### 核心目标

**1. 协议驱动，配置即表单**
- TSL/Profile 配置自动转换为表单，**无需手写代码**
- 配置变更自动生效，**需求响应时间缩短 70%**
- 支持动态表单，适配不同设备型号

**2. 高性能渲染**
- 精准渲染，只更新变化的字段组件
- 大表单场景下，响应时间 < 100ms
- 内存占用降低 **50%**

**3. 声明式联动配置**
- 联动关系配置化，**代码量减少 80%**
- 支持复杂联动场景（条件显示、级联选择、自动计算等）
- 配置可视化、可维护

**4. 完备的领域模型**
- 支持所有表单场景（嵌套对象、动态数组、分步表单等）
- 内置完整的校验体系
- 支持国际化、权限控制

**5. 跨端跨框架复用**
- 核心逻辑框架无关，React/Vue 共享
- 移动端、PC 端复用同一套配置
- **代码复用率 > 80%**

#### 预期收益

- **研发效率提升**：表单开发时间从 2-3 天缩短至 **0.5 天**
- **代码量减少**：单个表单代码量减少 **60-80%**
- **性能提升**：表单响应时间提升 **5 倍**
- **维护成本降低**：配置统一管理，维护成本降低 **50%**
- **质量提升**：配置错误率降低至 **<5%**

---

## 5. 详细设计

### 5.1 总体架构

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              TSL&Profile 设计工具                     │  业务层
│                                                     │
└─────────────────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────────────┐
│                              视图层                                   │
├─────────────────┬─────────────────┬────────────────────────────────┤
│      Ysd        │     Element     │       React Native             │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌────────────────────────────┐ │
│ │Form/Input   │ │ │Form/Input   │ │ │Form/Input (RN 组件)        │ │
│ │Select/...   │ │ │Select/...   │ │ │Select/... (@rn/paper)      │ │
│ │ArrayTabs    │ │ │ArrayTabs    │ │ │ArrayTable (FlatList)       │ │
│ │响应式适配   │ │ │             │ │ │原生渲染                    │ │
│ └─────────────┘ │ └─────────────┘ │ └────────────────────────────┘ │
│   Web/Webview   │      Vue        │          Native App            │
└─────────────────┴─────────────────┴────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────────────┐
│                             桥接层                                    │
├─────────────────────────────┬────────────────────────────────────────┤
│         React               │            Vue                         │
│  ┌────────────────────┐     │  ┌────────────────────┐                │
│  │ Field              │     │  │ Field              │                │
│  │ ArrayField         │     │  │ ArrayField         │                │
│  │ ObjectField        │     │  │ ObjectField        │                │
│  │ VoidField          │     │  │ VoidField          │                │
│  └────────────────────┘     │  └────────────────────┘                │
│  支持 Web + React Native    │         支持 Vue                       │
└─────────────────────────────┴────────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────────────┐
│                          核心层（跨端复用）                            │
├─────────────────────────────┬────────────────────────────────────────┤
│          Core               │           Schema                       │
│  ┌────────────────────┐     │  ┌────────────────────┐                │
│  │ Form Model         │     │  │                    │                │
│  │ Field Model        │     │  │   JSON Schema      │                │
│  │                    │     │  │        ↕           │                │
│  │ Lifecycles         │     │  │     Parser         │                │
│  │ Path System        │     │  │        ↕           │                │
│  │ Validator          │     │  │  TSL/Profile       │                │
│  │ Reactive           │     │  │     Schema         │                │
│  └────────────────────┘     │  └────────────────────┘                │
│                             │                                        │
│  ✅ 100% 跨端复用            │  ✅ 100% 跨端复用                       │
└─────────────────────────────┴────────────────────────────────────────┘
```

**架构说明**：

• **核心层**（✅ 100% 跨端复用）：
  - **core**: 定义 Form/Field 等核心模型，以及响应式能力；基于 @formily/core、@formily/reactive、@formily/validator 等核心库封装
  - **schema**: 定义 JSON Schema 模型和 TSL/Profile 模型，以及它们之间的解析转换；基于 @formily/json-schema 封装
  - **跨端能力**：纯 JavaScript 逻辑，无平台依赖，Web/Node.js/React Native/小程序均可使用

• **桥接层**（部分跨端）：
  - **react**: React 技术栈渲染胶水层，连接核心层与 React 组件库；基于 @formily/react 封装
    - ✅ 支持 Web（React DOM）
    - ✅ 支持 React Native
  - **vue**: Vue 技术栈渲染胶水层，连接核心层与 Vue 组件库；基于 @formily/vue 封装
    - ✅ 支持 Web（Vue）

• **视图层**（需分别适配）：
  - **ysd**: 提供开箱即用的基于 Ysd-iot 的表单组件
    - ✅ Web 端：完整支持
    - ✅ Webview：通过响应式适配支持移动端
  - **element**: 提供开箱即用的基于 ElementUI 的表单组件
    - ✅ Vue Web 端支持
  - **react-native**: 提供基于 React Native 的原生表单组件
    - ✅ iOS/Android 原生渲染
    - ⚠️ 需单独开发适配

---

### 5.2 拆分功能设计

#### 5.2.1 目录结构

```
dcform
├── docs                     # 文档目录
│   ├── guide.md             # 使用指南
│   ├── api.md               # API 文档
│   └── examples.md          # 示例文档
│
├── packages
│   ├── parser               # 配置解析器（TSL/Profile → JSON Schema）
│   │   ├── src
│   │   │   ├── tsl          # TSL 解析
│   │   │   │   ├── parser.ts
│   │   │   │   └── transformer.ts
│   │   │   ├── profile      # Profile 解析
│   │   │   │   ├── parser.ts
│   │   │   │   └── transformer.ts
│   │   │   ├── schema       # Schema 生成
│   │   │   │   └── builder.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── ysd                  # Ysd 表单组件库（React + Ysd-iot）
│   │   ├── src
│   │   │   ├── components   # 表单组件
│   │   │   │   ├── Form
│   │   │   │   ├── FormItem
│   │   │   │   ├── Input
│   │   │   │   ├── Select
│   │   │   │   ├── ArrayTabs
│   │   │   │   └── ...
│   │   │   ├── hooks        # React Hooks
│   │   │   ├── utils        # 工具函数
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── element              # Element 表单组件库（Vue + ElementUI）
│       ├── src
│       │   ├── components
│       │   ├── hooks
│       │   └── index.ts
│       ├── package.json
│       └── README.md
│
├── README.md
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

**设计要点**：

1. **core 包职责**：
   - 重新导出 Formily 核心 API（@formily/core、@formily/reactive 等）
   - 避免将 Formily 依赖直接暴露给业务方
   - 提供简化的 API 封装，降低学习成本

2. **parser 包职责**：
   - 解析 TSL/Profile 配置文件
   - 转换为标准 JSON Schema
   - 处理设备特殊逻辑

3. **ysd/element 包职责**：
   - 基于 core 包开发组件
   - 适配各自的 UI 组件库
   - 提供开箱即用的表单组件

---

#### 5.2.2 JSON Schema

**类型定义**

```typescript
interface ISchema {
  // ===== JSON Schema 标准字段 =====
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'void'
  title?: string              // 字段标题
  description?: string        // 字段描述
  default?: any               // 默认值
  required?: boolean | string[] // 是否必填
  enum?: Array<{ label: string; value: any }> // 枚举值
  properties?: Record<string, ISchema>        // 子属性（用于 object）
  items?: ISchema             // 数组项 Schema（用于 array）

  // ===== DCForm 扩展字段 =====
  name?: string               // 字段路径名称

  // 组件相关
  'x-component'?: string      // 渲染组件名称
  'x-component-props'?: any   // 组件 props
  'x-decorator'?: string      // 装饰器组件（如 FormItem）
  'x-decorator-props'?: any   // 装饰器 props

  // 联动相关
  'x-reactions'?: SchemaReactions  // 字段联动逻辑

  // 校验相关
  'x-validator'?: Validator[]      // 校验规则

  // 状态相关
  'x-visible'?: boolean       // 是否可见
  'x-hidden'?: boolean        // 是否隐藏（占位）
  'x-disabled'?: boolean      // 是否禁用
  'x-editable'?: boolean      // 是否可编辑
  'x-read-only'?: boolean     // 是否只读
  'x-read-pretty'?: boolean   // 是否阅读态

  // 数据相关
  'x-value'?: any             // 字段值
  'x-data'?: any              // 自定义数据
  'x-content'?: any           // 内容（用于展示）

  // 其他
  'x-index'?: number
  'x-pattern'?: 'editable' | 'disabled' | 'readOnly' | 'readPretty'  // 交互模式
  'x-display'?: 'visible' | 'hidden' | 'none'  // 展示状态
}
```

**字段类型说明**：

| type | 说明 | 示例场景 |
|------|------|---------|
| string | 字符串 | 文本输入、下拉选择 |
| number | 数字 | 数字输入、评分 |
| boolean | 布尔值 | 开关、复选框 |
| object | 对象 | 嵌套表单、地址信息 |
| array | 数组 | 动态列表、表格 |
| void | 虚拟节点 | 布局组件（Tab、Collapse） |

**需注意**：`void` 类型不存储数据，仅用于布局和 UI 组织，例如：

```typescript
// FormTab 是 void 类型，不产生数据
{
  type: 'void',
  'x-component': 'FormTab',
  properties: {
    tab1: {
      type: 'void',
      'x-component': 'FormTab.TabPane',
      'x-component-props': { tab: '基本信息' },
      properties: {
        // 实际的数据字段
        username: {
          type: 'string',
          'x-component': 'Input'
        }
      }
    }
  }
}
```

---

#### 5.2.3 校验设计

**校验规则定义**

```typescript
interface Validator {
  // 内置校验规则
  required?: boolean                    // 必填
  max?: number                          // 最大值/最大长度
  min?: number                          // 最小值/最小长度
  maxLength?: number                    // 最大长度
  minLength?: number                    // 最小长度
  pattern?: RegExp | string             // 正则表达式
  len?: number                          // 精确长度
  whitespace?: boolean                  // 是否允许空白字符
  enum?: any[]                          // 枚举值

  // 自定义校验
  validator?: (value: any, rule: Validator, context: ValidateContext) => ValidateResult

  // 触发时机
  triggerType?: 'onInput' | 'onFocus' | 'onBlur' | 'onSubmit'

  // 错误信息
  message?: string | ((value: any) => string)

  // 校验格式
  format?: 'url' | 'email' | 'ip' | 'number' | 'integer' | 'float' | 'date' | 'datetime'
}

type ValidateResult = null | string | boolean | Promise<ValidateResult>

interface ValidateContext {
  field: Field
  form: Form
}
```

**内置校验器**

DCForm 基于 Formily 提供以下内置校验器：

| 校验器 | 说明 | 示例 |
|-------|------|------|
| required | 必填校验 | `{ required: true, message: '请输入用户名' }` |
| pattern | 正则校验 | `{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }` |
| max/min | 数值范围 | `{ min: 0, max: 100, message: '请输入0-100之间的数值' }` |
| maxLength/minLength | 长度范围 | `{ minLength: 6, maxLength: 20, message: '密码长度6-20位' }` |
| format | 格式校验 | `{ format: 'email', message: '邮箱格式不正确' }` |
| validator | 自定义校验 | `{ validator: (value) => value !== 'admin' ? '用户名不可为admin' : null }` |

**校验配置示例**

```typescript
const schema: ISchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      'x-validator': [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
          message: '用户名必须以字母开头，只能包含字母、数字、下划线'
        },
      ]
    },

    password: {
      type: 'string',
      title: '密码',
      'x-component': 'Password',
      'x-decorator': 'FormItem',
      'x-validator': [
        { required: true },
        {
          validator: (value) => {
            if (!value) return null

            // 密码强度校验：至少包含大小写字母和数字
            const hasLower = /[a-z]/.test(value)
            const hasUpper = /[A-Z]/.test(value)
            const hasNumber = /[0-9]/.test(value)

            if (!hasLower || !hasUpper || !hasNumber) {
              return '密码必须包含大小写字母和数字'
            }

            return null
          }
        }
      ]
    },

    email: {
      type: 'string',
      title: '邮箱',
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      'x-validator': [
        { required: true },
        { format: 'email', message: '邮箱格式不正确' },
        {
          // 异步校验：检查邮箱是否已存在
          validator: async (value) => {
            const exists = await checkEmailExists(value)
            return exists ? '该邮箱已被注册' : null
          },
          triggerType: 'onBlur'
        }
      ]
    },

    age: {
      type: 'number',
      title: '年龄',
      'x-component': 'NumberPicker',
      'x-decorator': 'FormItem',
      'x-validator': [
        { required: true },
        { min: 18, max: 100, message: '年龄必须在18-100之间' }
      ]
    }
  }
}
```

**校验时机**

```typescript
// 1. 实时校验（onInput）
{
  'x-validator': [
    {
      pattern: /^\d+$/,
      message: '只能输入数字',
      triggerType: 'onInput'  // 输入时立即校验
    }
  ]
}

// 2. 失焦校验（onBlur）
{
  'x-validator': [
    {
      validator: async (value) => {
        return await checkUsername(value)
      },
      triggerType: 'onBlur'  // 失焦时校验（适合异步校验）
    }
  ]
}

// 3. 提交校验（onSubmit）
{
  'x-validator': [
    {
      validator: (value, rule, { form }) => {
        // 复杂的跨字段校验
        return null
      },
      triggerType: 'onSubmit'  // 表单提交时校验
    }
  ]
}
```

---

#### 5.2.4 联动机制

**联动类型**

Formily 提供两种联动方式：

1. **Effects（副作用）**：适合复杂的命令式联动逻辑
2. **Reactions（响应式）**：适合声明式的 Schema 配置

DCForm 主要使用 **Reactions** 方式，因为它：
- 可以序列化为 JSON
- 支持 TSL/Profile 配置转换
- 学习成本较低

**主动联动与被动联动**

x-reactions 支持两种联动模式：

**1. 被动联动（Passive Linkage）** - **推荐方式**

- **定义**：在"被影响字段"上配置 x-reactions，通过 `dependencies` 监听其他字段的变化
- **特点**：
  - 配置清晰，易于理解和维护
  - 符合响应式编程思想（数据流向明确）
  - 依赖关系一目了然
- **适用场景**：大多数联动场景，特别是单向数据流

```typescript
{
  province: {
    type: 'string',
    title: '省份',
    'x-component': 'Select'
  },

  // 被动联动：city 监听 province 的变化
  city: {
    type: 'string',
    title: '城市',
    'x-component': 'Select',
    'x-reactions': {
      dependencies: ['.province'],  // 监听省份字段
      fulfill: {
        state: {
          value: '{{undefined}}',  // 省份变化时，城市被动清空
        },
        schema: {
          'x-component-props': {
            // 根据省份动态更新城市选项
            options: `{{
              $deps[0] === 'guangdong'
                ? [{ label: '广州', value: 'gz' }]
                : []
            }}`
          }
        }
      }
    }
  }
}
```

**2. 主动联动（Active Linkage）**

- **定义**：在"影响源字段"上配置 x-reactions，通过 `target` 字段指定要操作的目标字段
- **特点**：
  - 配置清晰，使用 `target` 声明式指定目标
  - 可以同时影响多个字段（使用通配符）
  - 适合一对多、多对多联动场景
- **适用场景**：一对多联动、跨字段控制、批量重置

```typescript
{
  // 主动联动：province 主动影响 city
  province: {
    type: 'string',
    title: '省份',
    'x-component': 'Select',
    'x-reactions': {
      target: 'city',  // 指定目标字段
      fulfill: {
        state: {
          value: '{{undefined}}'  // 省份变化时，主动清空城市
        }
      }
    }
  },

  city: {
    type: 'string',
    title: '城市',
    'x-component': 'Select'
  }
}
```

**主动联动多个目标（使用通配符）**：

```typescript
{
  // 主动联动：province 同时清空 city 和 district
  province: {
    type: 'string',
    title: '省份',
    'x-component': 'Select',
    'x-reactions': {
      target: '*(city, district)',  // 通配符语法，同时影响多个字段
      fulfill: {
        state: {
          value: '{{undefined}}'
        }
      }
    }
  },

  city: {
    type: 'string',
    title: '城市',
    'x-component': 'Select'
  },

  district: {
    type: 'string',
    title: '区县',
    'x-component': 'Select'
  }
}
```

**Target 支持的语法**：

| 语法 | 说明 | 示例 |
|------|------|------|
| `"fieldName"` | 单个目标字段 | `target: "city"` |
| `"*(f1, f2, f3)"` | 多个目标字段 | `target: "*(city, district)"` |
| `".siblingField"` | 相对路径（兄弟字段） | `target: ".price"` |
| `"..parentField"` | 相对路径（父字段） | `target: "..total"` |
| `"array.*.field"` | 数组通配符 | `target: "items.*.price"` |

**对比总结**

| 对比项 | 被动联动 | 主动联动 |
|-------|---------|---------|
| 配置位置 | 被影响字段 | 影响源字段 |
| 核心配置 | dependencies 监听 | target 指定目标 |
| 数据流向 | 清晰（A → B） | 清晰（A → B，通过 target） |
| 维护性 | 好（依赖关系明确） | 好（目标明确） |
| 灵活性 | 一般（一对一/多对一） | 高（一对多/多对多） |
| 通配符支持 | - | 支持（`*(f1, f2)`） |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**最佳实践建议**：
1. **优先使用被动联动**：适合大部分场景，配置在被影响字段上，依赖关系清晰
2. **合理使用主动联动**：适合一对多场景，使用 `target` 字段明确指定目标
3. **避免 run 方式的主动联动**：`run` + `$form.setFieldState` 不推荐，应使用 `target` 字段
4. **避免双向联动**：容易造成循环依赖和死循环
5. **合理组织依赖**：将联动逻辑配置在数据流的合理位置

**主动联动 vs run 表达式**：

| 方式 | 示例 | 推荐度 | 说明 |
|------|------|--------|------|
| target（推荐） | `{ target: "city", fulfill: { state: { value: null } } }` | ⭐⭐⭐⭐⭐ | 声明式，可序列化，配置清晰 |
| run 表达式 | `{ fulfill: { run: "{{$form.setFieldState('city', ...)}}" } }` | ⭐⭐ | 命令式，不易维护，仅在复杂逻辑时使用 |

**Reactions 结构定义**

```typescript
interface SchemaReactions {
  // 依赖字段路径
  dependencies?: Array<string | {
    name: string
    type?: 'value' | 'state'  // 依赖字段的值或状态
  }>

  // 触发条件
  when?: string  // 表达式：{{$deps[0] === 'xxx'}}

  // 目标字段路径（主动联动）
  // 支持：单个字段 "fieldName"、多个字段 "*(f1, f2)"、相对路径 ".field"、通配符 "items.*.field"
  target?: string

  // 满足条件时执行
  fulfill?: {
    // 更新字段状态
    state?: {
      visible?: string | boolean
      hidden?: string | boolean
      disabled?: string | boolean
      editable?: string | boolean
      required?: string | boolean
      value?: any
      errors?: string | string[]
      warnings?: string | string[]
      [key: string]: any
    }

    // 更新 Schema
    schema?: Partial<ISchema>

    // 执行自定义逻辑（不推荐，仅在复杂场景使用）
    run?: string  // 表达式：{{/* JavaScript code */}}
  }

  // 不满足条件时执行
  otherwise?: {
    state?: any
    schema?: any
    run?: string
  }

  // 生命周期（主动联动可选）
  effects?: Array<'onFieldInit' | 'onFieldValueChange' | 'onFieldInputValueChange' | 'onFieldMount'>
}
```

**联动场景示例**

**场景 1：条件显示/隐藏**

```typescript
{
  type: 'object',
  properties: {
    userType: {
      type: 'string',
      title: '用户类型',
      enum: [
        { label: '个人用户', value: 'personal' },
        { label: '企业用户', value: 'enterprise' }
      ],
      'x-component': 'Select',
      'x-decorator': 'FormItem'
    },

    // 个人用户字段
    idCard: {
      type: 'string',
      title: '身份证号',
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'personal'}}",  // 仅个人用户可见
            required: "{{$deps[0] === 'personal'}}"   // 仅个人用户必填
          }
        }
      }
    },

    // 企业用户字段
    companyName: {
      type: 'string',
      title: '公司名称',
      'x-component': 'Input',
      'x-decorator': 'FormItem',
      'x-reactions': {
        dependencies: ['.userType'],
        fulfill: {
          state: {
            visible: "{{$deps[0] === 'enterprise'}}",
            required: "{{$deps[0] === 'enterprise'}}"
          }
        }
      }
    }
  }
}
```

**场景 2：级联选择（被动联动方式）**

```typescript
{
  type: 'object',
  properties: {
    province: {
      type: 'string',
      title: '省份',
      'x-component': 'Select',
      'x-decorator': 'FormItem',
      'x-component-props': {
        options: [
          { label: '广东省', value: 'guangdong' },
          { label: '浙江省', value: 'zhejiang' }
        ]
      }
    },

    city: {
      type: 'string',
      title: '城市',
      'x-component': 'Select',
      'x-decorator': 'FormItem',
      'x-reactions': [
        {
          // Reaction 1: 清空城市值
          dependencies: ['.province'],
          fulfill: {
            state: {
              value: '{{undefined}}'
            }
          }
        },
        {
          // Reaction 2: 更新城市选项
          dependencies: ['.province'],
          fulfill: {
            schema: {
              'x-component-props': {
                options: `{{
                  $deps[0] === 'guangdong'
                    ? [
                        { label: '广州市', value: 'guangzhou' },
                        { label: '深圳市', value: 'shenzhen' }
                      ]
                    : $deps[0] === 'zhejiang'
                    ? [
                        { label: '杭州市', value: 'hangzhou' },
                        { label: '宁波市', value: 'ningbo' }
                      ]
                    : []
                }}`
              }
            }
          }
        }
      ]
    }
  }
}
```

**场景 2b：级联选择（主动联动方式）**

当省份变化需要影响多个下级字段（城市、区县）时，主动联动更简洁：

```typescript
{
  type: 'object',
  properties: {
    province: {
      type: 'string',
      title: '省份',
      'x-component': 'Select',
      'x-decorator': 'FormItem',
      'x-component-props': {
        options: [
          { label: '广东省', value: 'guangdong' },
          { label: '浙江省', value: 'zhejiang' }
        ]
      },
      // 主动联动：清空城市和区县
      'x-reactions': {
        target: '*(city, district)',  // 同时影响多个字段
        fulfill: {
          state: {
            value: '{{undefined}}'  // 省份变化时，主动清空城市和区县
          }
        }
      }
    },

    city: {
      type: 'string',
      title: '城市',
      'x-component': 'Select',
      'x-decorator': 'FormItem',
      // 被动联动：根据省份更新选项
      'x-reactions': {
        dependencies: ['.province'],
        fulfill: {
          schema: {
            'x-component-props': {
              options: `{{
                $deps[0] === 'guangdong'
                  ? [{ label: '广州市', value: 'guangzhou' }]
                  : [{ label: '杭州市', value: 'hangzhou' }]
              }}`
            }
          }
        }
      }
    },

    district: {
      type: 'string',
      title: '区县',
      'x-component': 'Select',
      'x-decorator': 'FormItem',
      // 被动联动：根据城市更新选项
      'x-reactions': {
        dependencies: ['.city'],
        fulfill: {
          schema: {
            'x-component-props': {
              options: `{{
                $deps[0] === 'guangzhou'
                  ? [{ label: '天河区', value: 'tianhe' }]
                  : []
              }}`
            }
          }
        }
      }
    }
  }
}
```

**场景 3：自动计算**

```typescript
{
  type: 'object',
  properties: {
    quantity: {
      type: 'number',
      title: '数量',
      'x-component': 'NumberPicker',
      'x-decorator': 'FormItem'
    },

    unitPrice: {
      type: 'number',
      title: '单价',
      'x-component': 'NumberPicker',
      'x-decorator': 'FormItem'
    },

    totalPrice: {
      type: 'number',
      title: '总价',
      'x-component': 'NumberPicker',
      'x-decorator': 'FormItem',
      'x-component-props': {
        disabled: true
      },
      'x-reactions': {
        dependencies: ['.quantity', '.unitPrice'],
        fulfill: {
          run: `{{
            const quantity = $deps[0] || 0
            const unitPrice = $deps[1] || 0
            $self.value = (quantity * unitPrice).toFixed(2)
          }}`
        }
      }
    }
  }
}
```

**场景 4：数组字段联动（使用主动联动）**

```typescript
{
  type: 'object',
  properties: {
    products: {
      type: 'array',
      'x-component': 'ArrayTable',
      'x-decorator': 'FormItem',
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            'x-component': 'Select'
          },
          quantity: {
            type: 'number',
            'x-component': 'NumberPicker'
          },
          price: {
            type: 'number',
            'x-component': 'NumberPicker'
          },
          subtotal: {
            type: 'number',
            'x-component': 'NumberPicker',
            'x-component-props': { disabled: true },
            // 被动联动：计算行小计
            'x-reactions': {
              dependencies: ['.quantity', '.price'],
              fulfill: {
                state: {
                  value: '{{($deps[0] || 0) * ($deps[1] || 0)}}'
                }
              }
            }
          }
        }
      },
      // 主动联动：数组变化时更新总金额
      'x-reactions': {
        target: 'totalAmount',  // 主动更新总金额字段
        fulfill: {
          state: {
            value: `{{
              const items = $self.value || []
              return items.reduce((sum, item) => sum + (item?.subtotal || 0), 0)
            }}`
          }
        }
      }
    },

    totalAmount: {
      type: 'number',
      title: '总金额',
      'x-component': 'NumberPicker',
      'x-decorator': 'FormItem',
      'x-component-props': { disabled: true }
    }
  }
}
```

**场景 5：批量重置（主动联动的典型应用）**

```typescript
{
  type: 'object',
  properties: {
    resetButton: {
      type: 'void',
      'x-component': 'Button',
      'x-component-props': {
        children: '重置所有字段',
        onClick: `{{ (e) => $self.value = !$self.value }}`  // 触发值变化
      },
      // 主动联动：重置多个字段
      'x-reactions': {
        target: '*(username, password, email, phone)',  // 批量重置
        effects: ['onFieldValueChange'],  // 只在值变化时触发
        fulfill: {
          state: {
            value: '{{undefined}}'  // 清空所有目标字段
          }
        }
      }
    },

    username: {
      type: 'string',
      title: '用户名',
      'x-component': 'Input',
      'x-decorator': 'FormItem'
    },

    password: {
      type: 'string',
      title: '密码',
      'x-component': 'Password',
      'x-decorator': 'FormItem'
    },

    email: {
      type: 'string',
      title: '邮箱',
      'x-component': 'Input',
      'x-decorator': 'FormItem'
    },

    phone: {
      type: 'string',
      title: '手机号',
      'x-component': 'Input',
      'x-decorator': 'FormItem'
    }
  }
}
```

**表达式变量**

Reactions 表达式中可用的变量：

| 变量 | 说明 | 示例 |
|-----|------|------|
| `$self` | 当前字段 | `$self.value = 100` |
| `$deps` | 依赖字段值数组 | `$deps[0]`, `$deps[1]` |
| `$form` | 表单实例 | `$form.setFieldState(...)` |
| `$values` | 表单所有值 | `$values.username` |
| `$scope` | 作用域变量 | `$scope.customFn()` |

---

#### 5.2.5 解析器 Parser

**Parser 职责**

Parser 包负责将 TSL/Profile 配置转换为 Formily 可识别的 JSON Schema，核心流程如下：

```
TSL/Profile 配置
      ↓
   解析器解析
      ↓
  标准化处理
      ↓
  Schema 构建
      ↓
JSON Schema 输出
```

**TSL 配置结构**

```typescript
interface TSLConfig {
  id: string                    // 物模型 ID
  name: string                  // 物模型名称
  version: string               // 版本号
  properties: TSLProperty[]     // 属性列表
  events: TSLEvent[]            // 事件列表
  services: TSLService[]        // 服务列表
}

interface TSLProperty {
  identifier: string            // 属性标识符
  name: string                  // 属性名称
  dataType: {
    type: 'int' | 'float' | 'double' | 'text' | 'date' | 'bool' | 'enum' | 'struct' | 'array'
    specs?: any                 // 数据规格
  }
  required: boolean             // 是否必填
  accessMode: 'r' | 'w' | 'rw'  // 读写类型
  description?: string          // 描述
}
```

**Profile 配置结构**

```typescript
interface ProfileConfig {
  deviceType: string            // 设备类型
  model: string                 // 设备型号
  manufacturer: string          // 制造商
  protocol: string              // 通信协议
  uiConfig: ProfileUIConfig     // UI 配置
}

interface ProfileUIConfig {
  formLayout: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: number
  fields: ProfileField[]
}

interface ProfileField {
  identifier: string            // 对应 TSL identifier
  component: string             // 组件类型
  componentProps?: any          // 组件属性
  decorator?: string            // 装饰器
  decoratorProps?: any          // 装饰器属性
  reactions?: any[]             // 联动配置
  validator?: any[]             // 校验配置
  order?: number                // 排序
  group?: string                // 分组
}
```

**Parser 实现**

```typescript
// packages/parser/src/tsl/parser.ts

export class TSLParser {
  /**
   * 解析 TSL 配置
   */
  parse(tslConfig: TSLConfig): ISchema {
    const properties: Record<string, ISchema> = {}

    // 1. 解析属性
    tslConfig.properties.forEach(prop => {
      properties[prop.identifier] = this.parseProperty(prop)
    })

    // 2. 解析事件（如需要）
    // ...

    // 3. 解析服务（如需要）
    // ...

    return {
      type: 'object',
      properties
    }
  }

  /**
   * 解析单个属性
   */
  private parseProperty(prop: TSLProperty): ISchema {
    const schema: ISchema = {
      name: prop.identifier,
      title: prop.name,
      description: prop.description,
      required: prop.required
    }

    // 根据数据类型映射到 Schema type 和组件
    const { type, component, componentProps, validator } = this.mapDataType(prop.dataType)

    schema.type = type
    schema['x-component'] = component
    schema['x-component-props'] = componentProps
    schema['x-decorator'] = 'FormItem'

    if (validator) {
      schema['x-validator'] = validator
    }

    // 处理读写权限
    if (prop.accessMode === 'r') {
      schema['x-pattern'] = 'readPretty'
    } else if (prop.accessMode === 'w') {
      schema['x-editable'] = true
    }

    return schema
  }

  /**
   * 数据类型映射
   */
  private mapDataType(dataType: TSLProperty['dataType']) {
    const mapping = {
      int: {
        type: 'number',
        component: 'NumberPicker',
        componentProps: {
          precision: 0,
          min: dataType.specs?.min,
          max: dataType.specs?.max
        },
        validator: [
          {
            validator: (value: number) => {
              if (dataType.specs?.min !== undefined && value < dataType.specs.min) {
                return `最小值为 ${dataType.specs.min}`
              }
              if (dataType.specs?.max !== undefined && value > dataType.specs.max) {
                return `最大值为 ${dataType.specs.max}`
              }
              return null
            }
          }
        ]
      },
      float: {
        type: 'number',
        component: 'NumberPicker',
        componentProps: {
          precision: 2,
          min: dataType.specs?.min,
          max: dataType.specs?.max,
          step: dataType.specs?.step || 0.01
        }
      },
      text: {
        type: 'string',
        component: 'Input',
        componentProps: {
          maxLength: dataType.specs?.length
        }
      },
      date: {
        type: 'string',
        component: 'DatePicker',
        componentProps: {
          format: 'YYYY-MM-DD'
        }
      },
      bool: {
        type: 'boolean',
        component: 'Switch'
      },
      enum: {
        type: 'string',
        component: 'Select',
        componentProps: {
          options: dataType.specs?.map((item: any) => ({
            label: item.name,
            value: item.value
          }))
        }
      },
      struct: {
        type: 'object',
        component: 'FormGrid',
        // 递归处理结构体字段
      },
      array: {
        type: 'array',
        component: 'ArrayTable',
        // 处理数组项
      }
    }

    return mapping[dataType.type] || mapping.text
  }
}
```

**Profile Parser 实现**

```typescript
// packages/parser/src/profile/parser.ts

export class ProfileParser {
  /**
   * 合并 TSL Schema 和 Profile UI 配置
   */
  merge(tslSchema: ISchema, profileConfig: ProfileConfig): ISchema {
    const { uiConfig } = profileConfig
    const enhancedSchema: ISchema = {
      ...tslSchema,
      type: 'object',
      'x-component': 'FormLayout',
      'x-component-props': {
        layout: uiConfig.formLayout,
        labelWidth: uiConfig.labelWidth
      },
      properties: {}
    }

    // 遍历 Profile 字段配置
    uiConfig.fields.forEach(fieldConfig => {
      const baseFieldSchema = tslSchema.properties?.[fieldConfig.identifier]

      if (!baseFieldSchema) {
        console.warn(`Field ${fieldConfig.identifier} not found in TSL schema`)
        return
      }

      // 合并 Profile 配置到基础 Schema
      enhancedSchema.properties![fieldConfig.identifier] = {
        ...baseFieldSchema,
        'x-component': fieldConfig.component || baseFieldSchema['x-component'],
        'x-component-props': {
          ...baseFieldSchema['x-component-props'],
          ...fieldConfig.componentProps
        },
        'x-decorator': fieldConfig.decorator || baseFieldSchema['x-decorator'],
        'x-decorator-props': {
          ...baseFieldSchema['x-decorator-props'],
          ...fieldConfig.decoratorProps
        },
        'x-reactions': fieldConfig.reactions,
        'x-validator': [
          ...(baseFieldSchema['x-validator'] || []),
          ...(fieldConfig.validator || [])
        ],
        'x-index': fieldConfig.order
      }
    })

    // 根据 order 排序字段
    const sortedProperties: Record<string, ISchema> = {}
    Object.entries(enhancedSchema.properties!)
      .sort(([, a], [, b]) => (a['x-index'] || 0) - (b['x-index'] || 0))
      .forEach(([key, value]) => {
        sortedProperties[key] = value
      })

    enhancedSchema.properties = sortedProperties

    return enhancedSchema
  }
}
```

**使用示例**

```typescript
import { TSLParser, ProfileParser } from '@dcform/parser'

// 1. 解析 TSL
const tslParser = new TSLParser()
const tslSchema = tslParser.parse(tslConfig)

// 2. 合并 Profile
const profileParser = new ProfileParser()
const finalSchema = profileParser.merge(tslSchema, profileConfig)

// 3. 使用 Schema 渲染表单
const form = createForm()

<FormProvider form={form}>
  <SchemaField schema={finalSchema} />
</FormProvider>
```

---

#### 5.2.6 组件库设计

基于 @formily/react 桥接库封装 Ysd-iot 表单组件，包括：

**组件分类**

| 分类 | 组件 |
|-----|------|
| 布局组件 | FormLayout, FormItem, FormGrid, FormButtonGroup, Space, Submit, Reset |
| 输入控件 | Input, Password, Select, TreeSelect, DatePicker, TimePicker, NumberPicker, Transfer, Cascader, Radio, Checkbox, Upload, Switch |
| 场景组件 | ArrayCards, ArrayItems, ArrayTable, ArrayTabs, FormCollapse, FormStep, FormTab, FormDialog, FormDrawer, Editable |
| 阅读态组件 | PreviewText |

**组件适配实现**

ysd-iot 组件库基于 antd@4.15.0 版本深度定制，部分组件 API 与 antd 存在较大差异，且部分在大数据场景下存在性能问题，需重新开发。如：FormTable, TreeSelect, ArrayTabs 等。

适配封装的目的是将 Field 模型中的属性与组件属性进行映射，以实现表单组件的渲染。

**适配示例 1：Input 组件**

```typescript
// packages/ysd/src/components/Input/index.tsx

import React from 'react'
import { connect, mapProps, mapReadPretty } from '@dcform/core'
import { Input as YsdInput } from 'ysd-iot'
import { PreviewText } from '../PreviewText'

// 适配 Input 组件
export const Input = connect(
  YsdInput,
  mapProps((props, field) => {
    return {
      ...props,
      // 状态映射
      value: field.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        field.onInput(e.target.value)
      },
      disabled: !field.editable,
      readOnly: field.readOnly,
      // 显示 loading 状态
      suffix: field.loading ? <LoadingOutlined /> : props.suffix,
      // 显示错误状态
      status: field.validateStatus === 'error' ? 'error' : undefined
    }
  }),
  // 阅读态组件
  mapReadPretty(PreviewText.Input)
)

// 导出其他 Input 变体
export const Password = connect(
  YsdInput.Password,
  mapProps((props, field) => ({
    ...props,
    value: field.value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onInput(e.target.value)
    },
    disabled: !field.editable
  })),
  mapReadPretty(PreviewText.Input)
)

export const TextArea = connect(
  YsdInput.TextArea,
  mapProps((props, field) => ({
    ...props,
    value: field.value,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      field.onInput(e.target.value)
    },
    disabled: !field.editable
  })),
  mapReadPretty(PreviewText.Input)
)
```

**适配示例 2：Select 组件**

```typescript
// packages/ysd/src/components/Select/index.tsx

import React from 'react'
import { connect, mapProps, mapReadPretty } from '@dcform/core'
import { Select as YsdSelect } from 'ysd-iot'
import { PreviewText } from '../PreviewText'

export const Select = connect(
  YsdSelect,
  mapProps((props, field) => {
    return {
      ...props,
      value: field.value,
      onChange: (value: any) => {
        field.onInput(value)
      },
      disabled: !field.editable,
      loading: field.loading,
      // dataSource 映射为 options
      options: props.dataSource || props.options,
      status: field.validateStatus === 'error' ? 'error' : undefined
    }
  }),
  mapReadPretty(PreviewText.Select)
)
```

**适配示例 3：NumberPicker 组件**

```typescript
// packages/ysd/src/components/NumberPicker/index.tsx

import React from 'react'
import { connect, mapProps, mapReadPretty } from '@dcform/core'
import { InputNumber as YsdInputNumber } from 'ysd-iot'
import { PreviewText } from '../PreviewText'

export const NumberPicker = connect(
  YsdInputNumber,
  mapProps((props, field) => {
    return {
      ...props,
      value: field.value,
      onChange: (value: number | null) => {
        field.onInput(value)
      },
      disabled: !field.editable,
      status: field.validateStatus === 'error' ? 'error' : undefined
    }
  }),
  mapReadPretty(PreviewText.Number)
)
```

**适配示例 4：FormItem 装饰器**

```typescript
// packages/ysd/src/components/FormItem/index.tsx

import React from 'react'
import { connect, mapProps } from '@dcform/core'
import { Form } from 'ysd-iot'

const { Item } = Form

export const FormItem = connect(
  Item,
  mapProps(
    {
      // 属性名映射
      title: 'label',
      description: 'extra',
      required: true,
      validateStatus: true
    },
    (props, field) => {
      // 自定义映射逻辑
      return {
        ...props,
        label: props.title || props.label,
        extra: props.description || props.extra,
        required: field.required,
        validateStatus: field.validateStatus,
        help: field.selfErrors.length ? field.selfErrors : undefined,
        // 支持星号显示位置
        colon: props.colon !== false
      }
    }
  )
)
```

**适配示例 5：ArrayTable 组件**

```typescript
// packages/ysd/src/components/ArrayTable/index.tsx

import React from 'react'
import { ArrayField } from '@dcform/core'
import { Table, Button } from 'ysd-iot'
import { observer } from '@formily/react'

export const ArrayTable = observer((props: any) => {
  const field = ArrayField.useField()
  const schema = ArrayField.useFieldSchema()

  // 从 Schema 中提取列配置
  const columns = React.useMemo(() => {
    const itemSchema = schema.items as ISchema
    const properties = itemSchema?.properties || {}

    return Object.keys(properties).map(key => {
      const columnSchema = properties[key]
      return {
        key,
        title: columnSchema.title,
        dataIndex: key,
        width: columnSchema['x-component-props']?.width,
        render: (value: any, record: any, index: number) => {
          return (
            <ArrayField.Item index={index} record={record}>
              <RecursionField schema={columnSchema} name={key} />
            </ArrayField.Item>
          )
        }
      }
    })
  }, [schema])

  // 添加操作列
  columns.push({
    key: 'operations',
    title: '操作',
    width: 100,
    render: (_: any, __: any, index: number) => {
      return (
        <Button
          type="link"
          onClick={() => field.remove(index)}
        >
          删除
        </Button>
      )
    }
  })

  return (
    <div>
      <Table
        columns={columns}
        dataSource={field.value || []}
        pagination={false}
        {...props}
      />
      <Button
        type="dashed"
        block
        onClick={() => field.push({})}
        style={{ marginTop: 8 }}
      >
        添加一行
      </Button>
    </div>
  )
})
```

**组件注册**

```typescript
// packages/ysd/src/index.ts

import { createSchemaField } from '@dcform/core'
import * as Components from './components'

// 创建 SchemaField
export const SchemaField = createSchemaField({
  components: {
    // 布局组件
    FormLayout: Components.FormLayout,
    FormItem: Components.FormItem,
    FormGrid: Components.FormGrid,
    FormButtonGroup: Components.FormButtonGroup,
    Space: Components.Space,
    Submit: Components.Submit,
    Reset: Components.Reset,

    // 输入控件
    Input: Components.Input,
    Password: Components.Password,
    TextArea: Components.TextArea,
    Select: Components.Select,
    TreeSelect: Components.TreeSelect,
    DatePicker: Components.DatePicker,
    TimePicker: Components.TimePicker,
    NumberPicker: Components.NumberPicker,
    Transfer: Components.Transfer,
    Cascader: Components.Cascader,
    Radio: Components.Radio,
    Checkbox: Components.Checkbox,
    Upload: Components.Upload,
    Switch: Components.Switch,

    // 场景组件
    ArrayCards: Components.ArrayCards,
    ArrayItems: Components.ArrayItems,
    ArrayTable: Components.ArrayTable,
    ArrayTabs: Components.ArrayTabs,
    FormCollapse: Components.FormCollapse,
    FormStep: Components.FormStep,
    FormTab: Components.FormTab,
    FormDialog: Components.FormDialog,
    FormDrawer: Components.FormDrawer,
    Editable: Components.Editable,

    // 阅读态组件
    PreviewText: Components.PreviewText
  }
})

// 导出所有组件
export * from './components'
```

---

### 5.2.7 跨端适配方案

DCForm 的跨端能力是其核心优势之一，能够在保证业务逻辑一致的前提下，支持多端部署。

#### 跨端能力说明

**Parser 层天然跨端**

Parser 包（@dcform/parser）作为纯逻辑层，**完全框架无关**，可以在任何 JavaScript 运行环境中使用：

```typescript
// Parser 只负责 TSL/Profile → JSON Schema 转换
// 不依赖任何 UI 框架或平台 API

import { TSLParser, ProfileParser } from '@dcform/parser'

// ✅ Web 端使用
const schema = parser.parse(tslConfig)

// ✅ Node.js 服务端使用
const schema = parser.parse(tslConfig)

// ✅ React Native 使用
const schema = parser.parse(tslConfig)

// ✅ 小程序使用
const schema = parser.parse(tslConfig)
```

**核心层跨端支持**

@formily/core 和 @formily/reactive 同样是纯逻辑层，支持跨平台使用：

- **Form/Field 模型**：平台无关的表单状态管理
- **响应式系统**：平台无关的精准渲染能力
- **校验系统**：平台无关的校验能力
- **联动协议**：平台无关的 Reactions 机制

**视图层需要适配**

唯一需要适配的是视图层组件库，因为不同平台的 UI 组件库 API 不同：

- Web 端：基于 React + Ysd-iot/Element
- Native 端：
  - 方案1：Webview + 响应式适配
  - 方案2：React Native 组件库

---

#### 方案1：Webview + 响应式适配（推荐快速上线）

**方案概述**

在 Native 应用中嵌入 Webview，直接复用 Web 端的 @dcform/ysd 组件库，通过响应式布局适配移动端屏幕。

**架构图**

```
┌────────────────────────────────────────┐
│          Native 应用容器                │
│  ┌──────────────────────────────────┐  │
│  │          Webview                 │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │   @dcform/ysd (Web)        │  │  │
│  │  │   + 响应式适配层            │  │  │
│  │  │   + 移动端交互优化          │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  @dcform/parser (复用)          │  │
│  │  @formily/core (复用)           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Native Bridge (按需)                  │
│  - 文件上传                            │
│  - 相机调用                            │
│  - 本地存储                            │
└────────────────────────────────────────┘
```

**实现方案**

**1. @dcform/ysd 响应式增强**

在 ysd 组件库中增加移动端响应式支持：

```typescript
// packages/ysd/src/components/FormLayout/index.tsx

import { useResponsive } from '../../hooks/useResponsive'

export const FormLayout = (props) => {
  const { isMobile } = useResponsive()

  return (
    <YsdFormLayout
      {...props}
      // 移动端自动切换为垂直布局
      layout={isMobile ? 'vertical' : props.layout}
      // 移动端标签宽度为 100%
      labelCol={isMobile ? { span: 24 } : props.labelCol}
      wrapperCol={isMobile ? { span: 24 } : props.wrapperCol}
    />
  )
}
```

**2. 移动端样式优化**

```scss
// packages/ysd/src/styles/mobile.scss

@media (max-width: 768px) {
  // 表单项间距优化
  .dcform-form-item {
    margin-bottom: 16px;
  }

  // 输入框字体大小
  .dcform-input,
  .dcform-select {
    font-size: 16px; // 防止 iOS 自动放大
  }

  // 按钮组堆叠
  .dcform-button-group {
    flex-direction: column;

    button {
      width: 100%;
      margin-bottom: 8px;
    }
  }

  // ArrayTable 横向滚动
  .dcform-array-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

**3. 移动端交互优化**

```typescript
// packages/ysd/src/components/DatePicker/index.tsx

import { isMobile } from '../../utils/platform'

export const DatePicker = connect(
  YsdDatePicker,
  mapProps((props, field) => {
    return {
      ...props,
      // 移动端使用原生日期选择器
      inputReadOnly: isMobile(),
      // 移动端优化弹出层位置
      getPopupContainer: isMobile()
        ? () => document.body
        : props.getPopupContainer,
    }
  })
)
```

**4. Native Bridge 集成（可选）**

对于需要调用 Native 能力的场景，通过 Bridge 实现：

```typescript
// packages/ysd/src/components/Upload/index.tsx

export const Upload = connect(
  YsdUpload,
  mapProps((props, field) => {
    return {
      ...props,
      customRequest: async (options) => {
        // 检测是否在 Native Webview 中
        if (window.NativeBridge) {
          // 调用 Native 上传接口
          const result = await window.NativeBridge.uploadFile(options.file)
          options.onSuccess(result)
        } else {
          // Web 端上传
          uploadToServer(options)
        }
      }
    }
  })
)
```

**方案优势**

| 优势 | 说明 |
|-----|------|
| **开发成本低** | 复用 Web 端代码，无需重新开发 |
| **快速上线** | 预计 1-2 周完成响应式适配 |
| **维护成本低** | Web 和 Native 共享一套代码 |
| **一致性好** | Web 和 Native 表单体验完全一致 |
| **技术成熟** | Webview 技术成熟稳定 |

**方案劣势**

| 劣势 | 说明 | 缓解方案 |
|-----|------|---------|
| **性能较差** | Webview 性能不如原生 | 优化打包体积，使用懒加载 |
| **体验一般** | 无法使用原生 UI | 优化交互细节，使用原生样式 |
| **包体积大** | 需要加载 Web 资源 | 资源预加载，离线缓存 |

**适用场景**

- **快速 MVP 验证**：需要快速上线验证产品
- **表单为主的应用**：表单占比 > 60%
- **跨端一致性要求高**：需要 Web 和 Native 完全一致
- **开发资源有限**：Native 开发人员不足

---

#### 方案2：React Native 组件库（推荐长期维护）

**方案概述**

开发独立的 @dcform/react-native 组件库，基于 React Native 生态的 UI 组件库（如 react-native-paper、@ant-design/react-native）进行适配。

**架构图**

```
┌────────────────────────────────────────┐
│          Native 应用                   │
│  ┌──────────────────────────────────┐  │
│  │   @dcform/react-native           │  │
│  │   ┌──────────────────────────┐   │  │
│  │   │  组件适配层              │   │  │
│  │   │  - Input                 │   │  │
│  │   │  - Select                │   │  │
│  │   │  - DatePicker            │   │  │
│  │   │  - FormItem              │   │  │
│  │   │  - ...                   │   │  │
│  │   └──────────────────────────┘   │  │
│  │          ↓                        │  │
│  │   ┌──────────────────────────┐   │  │
│  │   │  @react-native/paper     │   │  │
│  │   │  或 @ant-design/rn       │   │  │
│  │   └──────────────────────────┘   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  @dcform/parser (复用)                 │
│  @formily/core (复用)                  │
└────────────────────────────────────────┘
```

**实现方案**

**1. 创建 React Native 包**

```
packages/
├── react-native/              # React Native 组件库
│   ├── src/
│   │   ├── components/        # 表单组件
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── DatePicker/
│   │   │   ├── FormItem/
│   │   │   └── ...
│   │   ├── hooks/             # React Native Hooks
│   │   ├── utils/             # 工具函数
│   │   └── index.ts
│   ├── package.json
│   └── README.md
```

**2. 常规组件适配（AI 辅助开发）**

基础输入组件（Input、Select、DatePicker 等）可以利用 AI 快速适配：

```typescript
// packages/react-native/src/components/Input/index.tsx

import React from 'react'
import { TextInput } from 'react-native-paper'
import { connect, mapProps, mapReadPretty } from '@dcform/core'
import { PreviewText } from '../PreviewText'

// AI 可以快速生成这类适配代码
export const Input = connect(
  TextInput,
  mapProps((props, field) => {
    return {
      ...props,
      value: field.value || '',
      onChangeText: (text) => {
        field.onInput(text)
      },
      editable: field.editable,
      error: field.validateStatus === 'error',
      disabled: !field.editable,
    }
  }),
  mapReadPretty(PreviewText.Input)
)
```

**AI 辅助开发流程**：

1. **准备参考代码**：提供 Web 端组件实现作为参考
2. **AI 生成适配代码**：使用 GPT-4/Claude 生成 RN 适配代码
3. **人工审查调整**：检查 API 差异，调整细节
4. **测试验证**：编写测试用例验证功能

预计常规组件适配效率：**1-2 天/组件** → **0.5-1 天/组件**（AI 辅助后）

**3. 场景组件适配（重点难点）**

ArrayTable、ArrayTabs、FormCollapse 等场景组件是开发成本的主要部分：

**ArrayTable 适配示例**：

```typescript
// packages/react-native/src/components/ArrayTable/index.tsx

import React from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { DataTable, Button, IconButton } from 'react-native-paper'
import { ArrayField } from '@dcform/core'
import { observer } from '@formily/react'

export const ArrayTable = observer((props: any) => {
  const field = ArrayField.useField()
  const schema = ArrayField.useFieldSchema()

  const columns = React.useMemo(() => {
    // 从 Schema 提取列配置
    const itemSchema = schema.items as ISchema
    const properties = itemSchema?.properties || {}

    return Object.keys(properties).map(key => ({
      key,
      title: properties[key].title,
      schema: properties[key]
    }))
  }, [schema])

  const renderItem = ({ item, index }) => (
    <DataTable.Row key={index}>
      {columns.map(column => (
        <DataTable.Cell key={column.key}>
          <ArrayField.Item index={index} record={item}>
            <RecursionField schema={column.schema} name={column.key} />
          </ArrayField.Item>
        </DataTable.Cell>
      ))}
      <DataTable.Cell>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => field.remove(index)}
        />
      </DataTable.Cell>
    </DataTable.Row>
  )

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          {columns.map(column => (
            <DataTable.Title key={column.key}>
              {column.title}
            </DataTable.Title>
          ))}
          <DataTable.Title>操作</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={field.value || []}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
        />
      </DataTable>

      <Button
        mode="outlined"
        onPress={() => field.push({})}
        style={styles.addButton}
      >
        添加一行
      </Button>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    marginTop: 8,
  }
})
```

**场景组件开发挑战**：

| 组件 | 难度 | 预计工时 | 主要挑战 |
|-----|------|---------|---------|
| ArrayTable | ⭐⭐⭐⭐ | 3-4 天 | 表格布局、性能优化、虚拟滚动 |
| ArrayTabs | ⭐⭐⭐ | 2-3 天 | 标签页切换、动态标签 |
| FormCollapse | ⭐⭐ | 1-2 天 | 折叠动画、状态管理 |
| FormStep | ⭐⭐⭐ | 2-3 天 | 步骤跳转、验证联动 |
| Upload | ⭐⭐⭐⭐ | 3-4 天 | 文件选择、上传进度、预览 |
| TreeSelect | ⭐⭐⭐⭐ | 3-4 天 | 树形结构、性能优化 |

**4. 平台差异处理**

```typescript
// packages/react-native/src/utils/platform.ts

import { Platform } from 'react-native'

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'

// 平台特定的日期选择器
export const DatePickerComponent = isIOS
  ? require('./DatePicker.ios').default
  : require('./DatePicker.android').default
```

**开发计划**

| 阶段 | 内容 | 工时估算 | 说明 |
|-----|------|---------|------|
| **阶段1** | 基础组件适配 | 2 周 | Input, Select, DatePicker, Switch 等 15+ 组件 |
| **阶段2** | 布局组件适配 | 1 周 | FormItem, FormLayout, FormGrid 等 |
| **阶段3** | 场景组件开发 | 3-4 周 | **重点难点**：ArrayTable, ArrayTabs, Upload, TreeSelect 等 |
| **阶段4** | 测试与优化 | 1 周 | 单元测试、集成测试、性能优化 |
| **总计** | - | **7-8 周** | 约 2 个月完成 |

**方案优势**

| 优势 | 说明 |
|-----|------|
| **性能优异** | 原生渲染，性能接近原生应用 |
| **体验一流** | 使用原生 UI 组件，交互体验好 |
| **包体积小** | 无需加载 Web 资源 |
| **离线支持** | 完全离线可用 |
| **社区生态** | React Native 生态成熟 |

**方案劣势**

| 劣势 | 说明 | 缓解方案 |
|-----|------|---------|
| **开发成本高** | 需要重新开发所有组件 | AI 辅助开发，降低成本 |
| **维护成本高** | Web 和 Native 两套代码 | 共享核心逻辑（Parser、Core） |
| **上线周期长** | 预计 2 个月开发周期 | 分阶段上线，优先基础功能 |

**适用场景**

- **长期维护的产品**：产品生命周期 > 2 年
- **性能要求高**：大量表单，对性能敏感
- **Native 功能多**：需要大量调用 Native 能力
- **独立 App**：独立的移动端应用，非内嵌

---

#### 方案对比与选型建议

**综合对比**

| 对比项 | Webview 方案 | React Native 方案 |
|-------|-------------|------------------|
| **开发周期** | 1-2 周 ⭐⭐⭐⭐⭐ | 7-8 周 ⭐⭐ |
| **开发成本** | 低 ⭐⭐⭐⭐⭐ | 高 ⭐⭐ |
| **性能表现** | 中 ⭐⭐⭐ | 优 ⭐⭐⭐⭐⭐ |
| **用户体验** | 一般 ⭐⭐⭐ | 优秀 ⭐⭐⭐⭐⭐ |
| **维护成本** | 低 ⭐⭐⭐⭐⭐ | 高 ⭐⭐ |
| **包体积** | 大 ⭐⭐ | 小 ⭐⭐⭐⭐ |
| **跨端一致性** | 高 ⭐⭐⭐⭐⭐ | 中 ⭐⭐⭐ |
| **离线能力** | 差 ⭐⭐ | 优 ⭐⭐⭐⭐⭐ |
| **扩展性** | 一般 ⭐⭐⭐ | 强 ⭐⭐⭐⭐ |

**选型建议**

**场景1：快速上线，验证市场（推荐 Webview）**

- 产品处于 MVP 阶段
- 需要快速验证产品方向
- 开发资源有限
- 短期内（6 个月内）迭代频繁

**实施路径**：
```
1. 开发 Web 端 @dcform/ysd（已完成）
2. 添加响应式适配（1 周）
3. 移动端样式优化（1 周）
4. 快速上线验证（2 周总计）
```

**场景2：长期产品，注重体验（推荐 React Native）**

- 产品已验证，进入成长期
- 用户量大，对性能和体验要求高
- 有足够的开发资源
- Native 功能需求多

**实施路径**：
```
1. 先用 Webview 方案快速上线（2 周）
2. 并行开发 React Native 组件库（2 个月）
3. 逐步迁移到 React Native（1 个月）
4. 完全切换到 React Native（3 个月总计）
```

**场景3：混合方案（推荐中大型产品）**

- 大部分表单使用 React Native（性能优先）
- 复杂表单/低频表单使用 Webview（开发效率优先）
- 根据表单复杂度和使用频率灵活选择

**实施路径**：
```
1. 核心高频表单用 React Native（2 个月）
2. 复杂低频表单用 Webview（随时可用）
3. 根据数据和反馈持续优化（持续迭代）
```

**成本效益分析**

| 方案 | 初期成本 | 长期成本 | ROI | 推荐度 |
|-----|---------|---------|-----|--------|
| **纯 Webview** | 2 周 | 低 | 快速上线场景 ⭐⭐⭐⭐ | 适合 MVP |
| **纯 React Native** | 8 周 | 高 | 长期维护场景 ⭐⭐⭐⭐ | 适合成熟产品 |
| **混合方案** | 4 周起步 | 中 | 平衡性价比 ⭐⭐⭐⭐⭐ | 推荐大型产品 |

---

#### 技术储备建议

**现阶段（Webview 方案）**

1. **响应式设计系统**
   - 断点设计：320px / 375px / 768px / 1024px
   - 布局适配：Grid / Flex 响应式布局
   - 字体适配：rem / vw 单位

2. **移动端优化**
   - 触摸优化：增大点击区域，优化手势
   - 性能优化：懒加载、虚拟滚动
   - 体验优化：Loading、骨架屏

3. **PWA 能力**
   - Service Worker：离线缓存
   - Manifest：桌面图标、启动画面
   - 推送通知：消息推送

**中期（React Native 储备）**

1. **组件库调研**
   - react-native-paper（Material Design）
   - @ant-design/react-native（国内生态好）
   - react-native-ui-lib（高性能）

2. **技术预研**
   - React Native 新架构（Fabric、TurboModules）
   - Expo（快速开发工具）
   - Hermes 引擎（性能优化）

3. **团队能力建设**
   - React Native 培训
   - 跨端开发最佳实践
   - 性能优化专项

---

## 6. 需求拆解

### 6.1 开发阶段划分

#### Web 端开发计划

| 阶段 | 目标 | 工作内容 | 预计工期 |
|-----|------|---------|---------|
| **阶段一：核心层** | 完成 core 和 parser 包开发 | 1. 封装 Formily 核心 API<br>2. 实现 TSL Parser<br>3. 实现 Profile Parser<br>4. 单元测试 | 2 周 |
| **阶段二：组件库** | 完成 ysd 组件库开发 | 1. 适配基础输入组件（15+）<br>2. 适配布局组件（7+）<br>3. 适配场景组件（10+）<br>4. 组件单元测试 | 3 周 |
| **阶段三：集成测试** | 完成端到端测试 | 1. 集成测试用例编写<br>2. TSL/Profile 转换测试<br>3. 表单渲染测试<br>4. 性能测试 | 1 周 |
| **阶段四：文档与示例** | 完善文档和示例 | 1. API 文档<br>2. 使用指南<br>3. 示例项目<br>4. 迁移指南 | 1 周 |

#### 跨端适配计划

**方案1：Webview + 响应式适配（快速上线）**

| 阶段 | 目标 | 工作内容 | 预计工期 |
|-----|------|---------|---------|
| **阶段一：响应式增强** | ysd 组件库响应式适配 | 1. 添加响应式 Hooks<br>2. 组件布局自适应<br>3. 移动端样式优化<br>4. 触摸交互优化 | 1 周 |
| **阶段二：移动端优化** | 移动端体验优化 | 1. 性能优化（懒加载、虚拟滚动）<br>2. 手势优化<br>3. 弹窗位置适配<br>4. 表单验证提示优化 | 1 周 |
| **阶段三：Bridge 集成** | Native 能力集成（可选） | 1. 文件上传 Bridge<br>2. 相机调用 Bridge<br>3. 本地存储 Bridge<br>4. 测试验证 | 1 周 |
| **总计** | - | - | **2-3 周** |

**方案2：React Native 组件库（长期维护）**

| 阶段 | 目标 | 工作内容 | 预计工期 |
|-----|------|---------|---------|
| **阶段一：基础组件** | 适配基础输入组件 | 1. Input, Password, TextArea<br>2. Select, Radio, Checkbox, Switch<br>3. DatePicker, TimePicker<br>4. NumberPicker<br>5. AI 辅助开发 + 人工审查 | 2 周 |
| **阶段二：布局组件** | 适配布局组件 | 1. FormItem, FormLayout<br>2. FormGrid, Space<br>3. FormButtonGroup<br>4. Submit, Reset | 1 周 |
| **阶段三：场景组件** | 开发场景组件（**重点**） | 1. ArrayTable（3-4 天）<br>2. ArrayTabs（2-3 天）<br>3. FormCollapse（1-2 天）<br>4. FormStep（2-3 天）<br>5. Upload（3-4 天）<br>6. TreeSelect（3-4 天） | 3-4 周 |
| **阶段四：测试优化** | 测试与优化 | 1. 单元测试<br>2. 集成测试<br>3. 性能优化<br>4. 真机测试 | 1 周 |
| **总计** | - | - | **7-8 周** |

### 6.2 功能优先级

**P0（必须实现）**：
- core 包基础能力
- parser 包 TSL 解析
- ysd 基础输入组件（Input、Select、DatePicker 等）
- ysd 布局组件（FormItem、FormLayout 等）
- **Web 端表单完整能力**

**P1（重要功能）**：
- parser 包 Profile 解析
- ysd 场景组件（ArrayTable、FormTab 等）
- 完整的校验体系
- 基础联动能力
- **Webview 响应式适配（移动端快速支持）**

**P2（增强功能）**：
- element 组件库（Vue）
- 高级联动场景
- 性能优化
- 开发工具
- **React Native 组件库（移动端原生体验）**

**P3（可选功能）**：
- 小程序适配
- Electron 桌面端适配
- 可视化配置工具
- AI 辅助表单生成

### 6.3 技术风险

| 风险项 | 风险等级 | 应对方案 |
|-------|---------|---------|
| ysd-iot 组件 API 差异 | 高 | 提前梳理差异点，制定适配方案 |
| 大数据量性能 | 中 | 实现虚拟滚动，按需渲染 |
| TSL/Profile 复杂度 | 中 | 分阶段支持，优先支持常见场景 |
| 学习成本 | 中 | 提供详细文档和示例 |
| **Webview 性能问题** | 中 | 优化打包体积，使用懒加载，资源预加载 |
| **移动端兼容性** | 中 | 充分测试 iOS/Android 各版本，使用 Polyfill |
| **React Native 开发成本** | 高 | AI 辅助开发，分阶段实施，优先核心组件 |
| **场景组件复杂度** | 高 | 预研技术方案，参考成熟组件库，投入足够资源 |
| **跨端一致性** | 中 | 共享 Parser 和 Core 层，定义统一的 Schema 规范 |

---

## 7. 专利设计

### 7.1 同类技术方案的缺点

**传统表单方案**（如 antd Form、rc-field-form）：
1. **领域模型不完整**：缺少完整的表单/字段模型抽象，难以表达复杂业务场景
2. **联动能力弱**：主要依赖命令式代码实现联动，难以序列化和配置化
3. **渲染性能差**：字段变化时容易触发全量渲染
4. **协议驱动困难**：无法直接从后端配置生成表单
5. **框架绑定强**：React/Vue 等框架专用，无法跨框架复用

**Formily 原生方案**：
1. **学习成本高**：概念多、API 复杂，上手门槛高
2. **定制困难**：需要深入理解框架才能定制
3. **组件适配复杂**：需要理解 connect、mapProps 等高级概念

### 7.2 本技术方案优势

1. **完整的领域模型**
   - 基于 Formily 的成熟表单模型
   - 支持复杂的字段类型（object、array、void 等）
   - 完整的生命周期管理

2. **协议驱动能力**
   - TSL/Profile → JSON Schema 自动转换
   - 支持动态表单生成
   - 配置可序列化、可存储

3. **高性能渲染**
   - 基于响应式系统的精准更新
   - 字段级别的渲染优化
   - 支持虚拟滚动和按需加载

4. **简化的 API**
   - 封装 Formily 复杂度
   - 提供开箱即用的组件库
   - 降低学习成本

5. **跨框架能力**
   - 核心层框架无关
   - 支持 React/Vue 等多框架
   - 业务逻辑可复用

6. **灵活的联动机制**
   - 声明式 Reactions 配置
   - 支持复杂的跨字段联动
   - 可序列化为 JSON

### 7.3 另外实施方式

1. **基于其他表单库实现**
   - 可以基于 react-hook-form、final-form 等实现
   - 核心思想：协议驱动 + 组件适配

2. **扩展到其他领域**
   - 可应用于移动端（React Native）
   - 可应用于桌面端（Electron）
   - 可应用于小程序

3. **增强型 Parser**
   - 支持更多配置格式（YAML、XML 等）
   - 支持可视化配置工具
   - 支持 AI 辅助生成

---

## 8. 相关链接

- [物模型相关痛点汇总](链接)
- [物模型重构专项](链接)
- [物模型维护表](链接)
- [设备 Profile 维护表](链接)
- [Formily 官方文档](https://formilyjs.org/)
- [ysd-iot 组件库文档](链接)

