# antfu/eslint-config 深度分析报告

## 目录
1. [项目概述](#项目概述)
2. [整体架构与设计理念](#整体架构与设计理念)
3. [Flat Config 格式详解](#flat-config-格式详解)
4. [规则组织与模块化设计](#规则组织与模块化设计)
5. [Stylistic 集成方案](#stylistic-集成方案)
6. [可扩展性与可配置性](#可扩展性与可配置性)
7. [API 设计与使用方式](#api-设计与使用方式)
8. [技术栈与依赖管理](#技术栈与依赖管理)
9. [Prettier vs Stylistic 设计决策](#prettier-vs-stylistic-设计决策)
10. [最佳实践与实际应用](#最佳实践与实际应用)

---

## 1. 项目概述

**@antfu/eslint-config** 是 Anthony Fu 开发的一套高度可配置、开箱即用的 ESLint 配置预设。该项目完全基于 ESLint 9+ 的 Flat Config 格式,旨在提供一个既简单又强大的 ESLint 配置方案。

### 核心特性

- **全面的语言支持**: 开箱即用支持 TypeScript、JSX、Vue、JSON、YAML、TOML、Markdown
- **可选框架集成**: React、Next.js、Svelte、UnoCSS、Astro、Solid
- **格式化与校验一体**: 使用 ESLint Stylistic 替代 Prettier,实现格式化和校验的统一
- **智能自动检测**: 自动检测 TypeScript 和 Vue,无需手动配置
- **高度可定制**: 通过 Flat Config 实现灵活的规则组合与覆盖
- **类型安全**: 完整的 TypeScript 类型定义支持

### 项目信息

- **GitHub**: https://github.com/antfu/eslint-config
- **最新版本**: v6.6.1 (2025年12月发布)
- **Stars**: 5.9k+
- **要求**: ESLint v9.5.0+

---

## 2. 整体架构与设计理念

### 2.1 设计理念

Anthony Fu 的 ESLint 配置遵循以下核心设计原则:

#### **"Minimal for reading, stable for diff, consistent"**

这个设计理念体现在:

1. **可读性优先**: 代码格式应该易于阅读,避免过度换行
2. **稳定的差异**: 代码变更应该产生最小化、可预测的 diff
3. **一致性**: 在整个项目中保持统一的代码风格

#### **一体化工具链**

与传统的 ESLint + Prettier 组合不同,antfu 选择了纯 ESLint 方案:

- ESLint 不仅用于代码质量检查,也负责代码格式化
- 使用 @stylistic/eslint-plugin 处理格式化规则
- 对于不被 ESLint 良好支持的文件(如 CSS、HTML),可选集成 Prettier/dprint

### 2.2 项目结构

根据搜索结果,项目采用了清晰的模块化结构:

```
antfu/eslint-config/
├── src/
│   ├── factory.ts              # 主工厂函数,核心入口
│   ├── types.ts                # TypeScript 类型定义
│   ├── configs/                # 各类配置模块
│   │   ├── ignores.ts          # 忽略文件配置
│   │   ├── javascript.ts       # JavaScript 基础规则
│   │   ├── typescript.ts       # TypeScript 规则
│   │   ├── vue.ts              # Vue 框架规则
│   │   ├── react.ts            # React 框架规则
│   │   ├── jsonc.ts            # JSON/JSONC 规则
│   │   ├── yaml.ts             # YAML 规则
│   │   ├── markdown.ts         # Markdown 规则
│   │   ├── stylistic.ts        # 格式化规则
│   │   ├── comments.ts         # 注释相关规则
│   │   ├── imports.ts          # 导入排序规则
│   │   ├── jsdoc.ts            # JSDoc 规则
│   │   ├── node.ts             # Node.js 规则
│   │   ├── perfectionist.ts    # 代码排序规则
│   │   └── ...
│   └── utils/                  # 工具函数
├── package.json                # 依赖管理(使用 pnpm catalog)
├── eslint.config.ts            # 项目自身的配置
└── README.md
```

### 2.3 架构特点

1. **模块化设计**: 每个配置模块职责单一,可独立使用
2. **组合式 API**: 通过工厂函数组合不同的配置模块
3. **类型安全**: 完整的 TypeScript 类型支持
4. **插件命名规范化**: 统一的插件命名约定(如 `@typescript-eslint` → `ts`)

---

## 3. Flat Config 格式详解

### 3.1 什么是 Flat Config

ESLint Flat Config 是 ESLint 9+ 引入的新配置格式,旨在替代传统的 `.eslintrc.*` 配置文件。

#### 传统配置 vs Flat Config

**传统配置 (.eslintrc.js):**
```javascript
module.exports = {
  extends: ['eslint:recommended', 'plugin:vue/recommended'],
  plugins: ['vue'],
  rules: {
    'vue/html-indent': ['error', 2]
  }
}
```

**Flat Config (eslint.config.js):**
```javascript
import vue from 'eslint-plugin-vue'

export default [
  {
    files: ['**/*.vue'],
    plugins: { vue },
    rules: {
      'vue/html-indent': ['error', 2]
    }
  }
]
```

### 3.2 Flat Config 的优势

1. **更好的组织性**: 配置以数组形式组织,逻辑清晰
2. **更强的可组合性**: 可以轻松合并、拆分配置
3. **显式的插件管理**: 插件作为 ES Module 导入,版本控制更清晰
4. **更好的类型支持**: 易于实现 TypeScript 类型推断

### 3.3 antfu 的 Flat Config 实现

#### 核心工厂函数

根据搜索结果,`factory.ts` 导出主要的 `antfu()` 函数:

```typescript
// 简化的类型签名
function antfu(
  options?: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'>,
  ...userConfigs: Awaitable<TypedFlatConfigItem | TypedFlatConfigItem[]>[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames>
```

#### 配置组合流程

```javascript
// factory.ts 的内部逻辑(简化版)
export function antfu(options = {}, ...userConfigs) {
  const {
    typescript: enableTypeScript = true,
    vue: enableVue = true,
    react: enableReact = false,
    gitignore: enableGitignore = true,
    stylistic: enableStylistic = true,
    // ... 更多选项
  } = options

  const configs = []

  // 1. 基础配置
  configs.push(
    ignores(userIgnores),
    javascript(),
    comments(),
    node(),
    jsdoc(),
    imports(),
    command(),
    perfectionist()
  )

  // 2. TypeScript 配置(自动检测或手动启用)
  if (enableTypeScript) {
    configs.push(typescript())
  }

  // 3. Vue 配置(自动检测或手动启用)
  if (enableVue) {
    configs.push(vue())
  }

  // 4. React 配置
  if (enableReact) {
    configs.push(react())
  }

  // 5. 格式化配置
  if (enableStylistic) {
    configs.push(stylistic())
  }

  // 6. 用户自定义配置
  configs.push(...userConfigs)

  // 返回 FlatConfigComposer 实例
  return new FlatConfigComposer(configs)
}
```

### 3.4 FlatConfigComposer

从 v2.10.0 开始,`antfu()` 返回一个 `FlatConfigComposer` 对象,这是来自 `@antfu/eslint-flat-config-utils` 包的工具类。

#### 核心方法

```typescript
interface FlatConfigComposer {
  // 在开头添加配置
  prepend(...configs: FlatConfigItem[]): this

  // 在末尾添加配置
  append(...configs: FlatConfigItem[]): this

  // 覆盖特定配置
  override(nameOrIndex: string | number, config: FlatConfigItem): this

  // 在特定配置后插入
  insertAfter(nameOrIndex: string | number, ...configs: FlatConfigItem[]): this

  // 重命名插件
  renamePlugins(map: Record<string, string>): this
}
```

#### 使用示例

```javascript
import antfu from '@antfu/eslint-config'

export default antfu()
  .prepend({
    // 在所有规则之前的全局配置
    ignores: ['dist', 'node_modules']
  })
  .override('antfu/stylistic/rules', {
    rules: {
      'style/indent': ['error', 2]
    }
  })
  .append({
    // 在所有规则之后的自定义配置
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 'off'
    }
  })
```

---

## 4. 规则组织与模块化设计

### 4.1 配置模块分类

antfu/eslint-config 将规则组织为以下几类模块:

#### 基础模块

1. **ignores**: 全局忽略文件配置
2. **javascript**: JavaScript 基础规则
3. **comments**: 注释相关规则
4. **node**: Node.js 环境规则
5. **imports**: 导入语句规则
6. **jsdoc**: JSDoc 注释规则

#### 语言支持模块

1. **typescript**: TypeScript 规则
2. **vue**: Vue.js 规则
3. **react**: React 规则
4. **jsonc**: JSON/JSONC 规则
5. **yaml**: YAML 规则
6. **toml**: TOML 规则
7. **markdown**: Markdown 规则

#### 格式化模块

1. **stylistic**: 基于 @stylistic/eslint-plugin 的格式化规则
2. **formatters**: 外部格式化工具集成(Prettier、dprint)

#### 增强模块

1. **perfectionist**: 代码排序规则(导入、对象键等)
2. **command**: 特殊命令支持

### 4.2 规则组织原则

#### 按文件类型应用规则

```javascript
// TypeScript 规则只在 .ts 文件中生效
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'ts/consistent-type-definitions': ['error', 'interface']
  }
}

// Vue 规则只在 .vue 文件中生效
{
  files: ['**/*.vue'],
  rules: {
    'vue/html-indent': ['error', 2]
  }
}
```

#### 自动检测机制

对于 TypeScript 和 Vue,配置会自动检测项目依赖:

```javascript
// 自动检测 TypeScript
const hasTypeScript = hasPackage('typescript')

// 自动检测 Vue
const hasVue = hasPackage('vue')
```

### 4.3 插件重命名

为了一致性和简洁性,antfu 对插件进行了重命名:

```javascript
const pluginRenames = {
  '@typescript-eslint': 'ts',
  '@stylistic': 'style',
  'import-lite': 'import',
  'n': 'node',
  'vitest': 'test',
  'yml': 'yaml'
}
```

使用时:

```javascript
// 原始名称
'@typescript-eslint/consistent-type-definitions': 'error'

// 重命名后
'ts/consistent-type-definitions': 'error'
```

### 4.4 配置模块示例

#### TypeScript 配置模块

```typescript
// src/configs/typescript.ts (简化示例)
export function typescript(options = {}) {
  const {
    tsconfigPath,
    overrides = {}
  } = options

  return [
    {
      name: 'antfu/typescript/setup',
      plugins: {
        ts: typescriptPlugin
      }
    },
    {
      name: 'antfu/typescript/rules',
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'ts/consistent-type-definitions': ['error', 'interface'],
        'ts/consistent-type-imports': ['error', {
          prefer: 'type-imports',
          disallowTypeAnnotations: false
        }],
        // ... 更多规则
        ...overrides
      }
    }
  ]
}
```

#### Vue 配置模块

```typescript
// src/configs/vue.ts (简化示例)
export function vue(options = {}) {
  const {
    vueVersion = 3,
    overrides = {}
  } = options

  return [
    {
      name: 'antfu/vue/setup',
      plugins: {
        vue: vuePlugin
      }
    },
    {
      name: 'antfu/vue/rules',
      files: ['**/*.vue'],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module'
        }
      },
      rules: {
        'vue/html-indent': ['error', 2],
        'vue/max-attributes-per-line': 'off',
        'vue/multi-word-component-names': 'off',
        // ... 更多规则
        ...overrides
      }
    }
  ]
}
```

---

## 5. Stylistic 集成方案

### 5.1 为什么选择 @stylistic/eslint-plugin

ESLint 官方宣布弃用格式化规则后,社区分裂为两派:

1. **Prettier 派**: 使用 Prettier 处理格式化
2. **ESLint Stylistic 派**: 使用 @stylistic/eslint-plugin 继续在 ESLint 中处理格式化

antfu 选择了后者,原因包括:

- **统一工具链**: 避免维护 ESLint 和 Prettier 两套配置
- **更灵活的控制**: 可以按文件类型定制格式化规则
- **保留原始换行**: 尊重开发者的换行决策,而非强制重排
- **更好的性能**: 单一工具链,减少工具切换开销

### 5.2 Stylistic 配置

#### 基本启用

```javascript
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: true
})
```

#### 自定义配置

```javascript
export default antfu({
  stylistic: {
    indent: 2,          // 或 4, 'tab'
    quotes: 'single',   // 或 'double'
    semi: false,        // 是否使用分号
    jsx: true,          // 启用 JSX 格式化
    arrowParens: true   // 箭头函数参数括号
  }
})
```

#### 详细配置选项

```typescript
interface StylisticConfig {
  indent?: 'tab' | number
  quotes?: 'single' | 'double'
  semi?: boolean
  jsx?: boolean
  arrowParens?: boolean
  braceStyle?: '1tbs' | 'stroustrup' | 'allman'
  blockSpacing?: boolean
  lessOpinionated?: boolean  // 减少主观规则
  overrides?: Rules
}
```

### 5.3 核心 Stylistic 规则

```javascript
// src/configs/stylistic.ts 中的核心规则
const stylisticRules = {
  // 缩进
  'style/indent': ['error', 2],

  // 引号
  'style/quotes': ['error', 'single'],

  // 分号
  'style/semi': ['error', 'never'],

  // 逗号
  'style/comma-dangle': ['error', 'always-multiline'],

  // 对象/数组括号空格
  'style/object-curly-spacing': ['error', 'always'],
  'style/array-bracket-spacing': ['error', 'never'],

  // 箭头函数
  'style/arrow-parens': ['error', 'as-needed'],
  'style/arrow-spacing': ['error', { before: true, after: true }],

  // 运算符换行
  'style/operator-linebreak': ['error', 'before'],

  // 函数括号前空格
  'style/space-before-function-paren': ['error', {
    anonymous: 'always',
    named: 'never',
    asyncArrow: 'always'
  }],

  // JSX 特定规则
  'style/jsx-indent': ['error', 2],
  'style/jsx-quotes': ['error', 'prefer-double'],
  'style/jsx-closing-bracket-location': ['error', 'line-aligned']
}
```

### 5.4 VS Code 集成

为了在编辑器中正确显示格式化规则:

```json
// .vscode/settings.json
{
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // 使用 ESLint 自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // 静默 stylistic 规则(不在编辑器中显示波浪线)
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off" },
    { "rule": "format/*", "severity": "off" },
    { "rule": "*-indent", "severity": "off" },
    { "rule": "*-spacing", "severity": "off" },
    { "rule": "*-spaces", "severity": "off" },
    { "rule": "*-order", "severity": "off" },
    { "rule": "*-dangle", "severity": "off" },
    { "rule": "*-newline", "severity": "off" },
    { "rule": "*quotes", "severity": "off" },
    { "rule": "*semi", "severity": "off" }
  ],

  // ESLint 验证的文件类型
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml"
  ]
}
```

### 5.5 Stylistic 的设计理念

根据 Anthony Fu 的博客文章 "Why I don't use Prettier":

#### 核心原则

1. **尊重开发者的换行决策**
   - Prettier 会基于 printWidth 强制换行
   - Stylistic 保留原有换行,只修复格式问题

2. **稳定的 diff**
   - 避免不必要的代码重排
   - 减少 git diff 噪音

3. **最小化阅读**
   - 不强制每行最大字符数
   - 允许合理的长行

#### 示例对比

**Prettier 的行为:**
```javascript
// 输入
const result = someFunction(arg1, arg2, arg3, arg4)

// Prettier 输出(假设超过 printWidth)
const result = someFunction(
  arg1,
  arg2,
  arg3,
  arg4
)
```

**Stylistic 的行为:**
```javascript
// 输入
const result = someFunction(arg1, arg2, arg3, arg4)

// Stylistic 输出(保留原换行)
const result = someFunction(arg1, arg2, arg3, arg4)
```

---

## 6. 可扩展性与可配置性

### 6.1 配置层级

antfu/eslint-config 提供了多层次的配置能力:

#### Level 1: 预设选项

最简单的配置方式,通过选项启用/禁用功能:

```javascript
import antfu from '@antfu/eslint-config'

export default antfu({
  // 框架支持
  typescript: true,
  vue: true,
  react: true,

  // 格式化
  stylistic: {
    indent: 2,
    quotes: 'single'
  },

  // 文件类型
  jsonc: false,
  yaml: false,

  // 忽略文件
  ignores: ['**/fixtures', '**/dist']
})
```

#### Level 2: 框架特定覆盖

每个框架配置都支持 `overrides` 选项:

```javascript
export default antfu({
  vue: {
    overrides: {
      'vue/max-attributes-per-line': ['error', { singleline: 5 }],
      'vue/html-self-closing': 'off'
    }
  },

  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['error', 'type']
    }
  }
})
```

#### Level 3: 添加配置对象

追加完整的配置对象:

```javascript
export default antfu(
  {
    vue: true,
    typescript: true
  },

  // 自定义配置对象
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 'off',
      'no-debugger': 'off'
    }
  },

  {
    files: ['**/scripts/*.ts'],
    rules: {
      'no-console': 'off'
    }
  }
)
```

#### Level 4: 使用 Composer API

使用 FlatConfigComposer 进行高级操作:

```javascript
export default antfu({ vue: true })
  .prepend({
    // 全局忽略
    ignores: ['**/generated']
  })
  .override('antfu/typescript/rules', {
    rules: {
      'ts/no-explicit-any': 'warn'
    }
  })
  .insertAfter('antfu/vue/rules', {
    files: ['**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase']
    }
  })
  .renamePlugins({
    'old-name': 'new-name'
  })
```

### 6.2 忽略文件配置

#### 全局忽略

```javascript
export default antfu({
  ignores: [
    '**/fixtures',
    '**/dist',
    '**/node_modules',
    '**/*.min.js'
  ]
})
```

#### gitignore 集成

默认情况下,配置会解析 `.gitignore` 文件:

```javascript
export default antfu({
  gitignore: true  // 默认开启
})

// 或关闭
export default antfu({
  gitignore: false
})

// 或指定 gitignore 文件路径
export default antfu({
  gitignore: {
    files: ['.gitignore', '.gitignore.local']
  }
})
```

### 6.3 按文件类型自定义规则

#### 使用 files 模式

```javascript
export default antfu(
  { vue: true },

  // Vue 组件特定规则
  {
    files: ['**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style']
      }]
    }
  },

  // 测试文件特定规则
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      'ts/no-non-null-assertion': 'off'
    }
  },

  // 配置文件特定规则
  {
    files: ['**/vite.config.ts', '**/rollup.config.ts'],
    rules: {
      'import/no-default-export': 'off'
    }
  }
)
```

### 6.4 减少主观规则

如果觉得某些规则过于主观,可以使用 `lessOpinionated` 选项:

```javascript
export default antfu({
  lessOpinionated: true
})
```

这会禁用一些更主观的自定义规则,让配置更接近社区标准。

### 6.5 插件重命名

如果你不喜欢默认的插件名称重命名:

```javascript
export default antfu({
  autoRenamePlugins: false  // 禁用自动重命名
})

// 或手动指定重命名
export default antfu()
  .renamePlugins({
    'ts': 'typescript',
    'style': 'stylistic'
  })
```

### 6.6 完整配置示例

一个综合了多种配置技术的完整示例:

```javascript
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    // 项目类型
    type: 'lib',  // 'lib' 或 'app'

    // 语言和框架
    typescript: {
      tsconfigPath: './tsconfig.json',
      overrides: {
        'ts/consistent-type-definitions': ['error', 'interface']
      }
    },
    vue: {
      vueVersion: 3,
      overrides: {
        'vue/max-attributes-per-line': 'off'
      }
    },
    react: {
      version: '18.0',
      overrides: {
        'react/prop-types': 'off'
      }
    },

    // 格式化
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
      jsx: true
    },

    // 文件类型
    jsonc: true,
    yaml: true,
    markdown: true,

    // 格式化工具
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier'
    },

    // 忽略
    ignores: [
      '**/dist',
      '**/coverage',
      '**/fixtures'
    ],
    gitignore: true,

    // 其他选项
    lessOpinionated: false,
    autoRenamePlugins: true
  },

  // 自定义规则覆盖
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn'
    }
  },

  // 测试文件规则
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      'ts/no-explicit-any': 'off'
    }
  },

  // Vue 组件规则
  {
    files: ['**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase']
    }
  }
)
  // 使用 Composer API 进行额外配置
  .override('antfu/typescript/rules', {
    rules: {
      'ts/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  })
```

---

## 7. API 设计与使用方式

### 7.1 核心 API

#### antfu(options?, ...userConfigs)

主工厂函数,返回 `FlatConfigComposer` 实例。

**类型签名:**

```typescript
function antfu(
  options?: OptionsConfig & Omit<TypedFlatConfigItem, 'files' | 'ignores'>,
  ...userConfigs: Awaitable<
    TypedFlatConfigItem |
    TypedFlatConfigItem[] |
    FlatConfigComposer<any, any> |
    Linter.Config[]
  >[]
): FlatConfigComposer<TypedFlatConfigItem, ConfigNames>
```

**参数说明:**

- `options`: 配置选项对象
  - 不能包含 `files` 或 `ignores` 属性(这些应该在后续配置中指定)
  - 支持所有预设选项(typescript, vue, react, stylistic 等)

- `userConfigs`: 用户自定义配置
  - 可以是单个配置对象、配置数组或 FlatConfigComposer
  - 支持 Promise(异步配置)

### 7.2 配置选项接口

```typescript
interface OptionsConfig {
  // 项目类型
  type?: 'app' | 'lib'

  // 语言和框架
  typescript?: boolean | OptionsTypeScript
  vue?: boolean | OptionsVue
  react?: boolean | OptionsReact
  svelte?: boolean | OptionsSvelte
  astro?: boolean | OptionsAstro
  solid?: boolean | OptionsSolid
  nextjs?: boolean

  // 文件类型
  jsonc?: boolean | OptionsJsonc
  yaml?: boolean | OptionsYaml
  toml?: boolean | OptionsToml
  markdown?: boolean | OptionsMarkdown

  // 格式化
  stylistic?: boolean | StylisticConfig
  formatters?: boolean | OptionsFormatters

  // 其他
  ignores?: string[]
  gitignore?: boolean | GitignoreOptions
  lessOpinionated?: boolean
  autoRenamePlugins?: boolean

  // 组件扩展名
  componentExts?: string[]
}
```

### 7.3 TypeScript 配置选项

```typescript
interface OptionsTypeScript {
  // tsconfig.json 路径
  tsconfigPath?: string

  // 启用类型感知规则
  parserOptions?: {
    project?: string | string[]
    tsconfigRootDir?: string
  }

  // 规则覆盖
  overrides?: Rules

  // 文件模式
  files?: string[]
}
```

**使用示例:**

```javascript
export default antfu({
  typescript: {
    tsconfigPath: './tsconfig.json',
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    },
    overrides: {
      'ts/no-explicit-any': 'warn',
      'ts/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }]
    }
  }
})
```

### 7.4 Vue 配置选项

```typescript
interface OptionsVue {
  // Vue 版本
  vueVersion?: 2 | 3

  // 规则覆盖
  overrides?: Rules

  // 文件模式
  files?: string[]

  // TypeScript 支持
  typescript?: boolean
}
```

**使用示例:**

```javascript
export default antfu({
  vue: {
    vueVersion: 3,
    overrides: {
      'vue/max-attributes-per-line': ['error', {
        singleline: 3,
        multiline: 1
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        }
      }]
    }
  }
})
```

### 7.5 React 配置选项

```typescript
interface OptionsReact {
  // React 版本
  version?: string

  // 规则覆盖
  overrides?: Rules

  // 文件模式
  files?: string[]

  // TypeScript 支持
  typescript?: boolean
}
```

**使用示例:**

```javascript
export default antfu({
  react: {
    version: '18.2',
    overrides: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
})
```

### 7.6 Stylistic 配置选项

```typescript
interface StylisticConfig {
  // 缩进
  indent?: 'tab' | number

  // 引号
  quotes?: 'single' | 'double'

  // 分号
  semi?: boolean

  // JSX 支持
  jsx?: boolean

  // 箭头函数括号
  arrowParens?: boolean

  // 大括号风格
  braceStyle?: '1tbs' | 'stroustrup' | 'allman'

  // 块语句空格
  blockSpacing?: boolean

  // 减少主观规则
  lessOpinionated?: boolean

  // 规则覆盖
  overrides?: Rules
}
```

### 7.7 Formatters 配置选项

```typescript
interface OptionsFormatters {
  // CSS 格式化
  css?: boolean | 'prettier' | 'dprint'

  // HTML 格式化
  html?: boolean | 'prettier' | 'dprint'

  // Markdown 格式化
  markdown?: boolean | 'prettier' | 'dprint'

  // GraphQL 格式化
  graphql?: boolean | 'prettier'

  // 格式化工具配置
  prettierOptions?: PrettierOptions
  dprintOptions?: DprintOptions
}
```

**使用示例:**

```javascript
export default antfu({
  formatters: {
    css: true,        // 使用默认 Prettier
    html: 'dprint',   // 使用 dprint
    markdown: 'prettier',
    graphql: true,

    // Prettier 选项
    prettierOptions: {
      printWidth: 100,
      singleQuote: true
    }
  }
})
```

### 7.8 FlatConfigComposer API

`antfu()` 返回的 `FlatConfigComposer` 实例提供链式 API:

#### prepend(...configs)

在配置数组开头添加配置:

```javascript
export default antfu()
  .prepend({
    ignores: ['**/vendor']
  })
```

#### append(...configs)

在配置数组末尾添加配置:

```javascript
export default antfu()
  .append({
    files: ['**/*.custom.ts'],
    rules: {
      'custom-rule': 'error'
    }
  })
```

#### override(nameOrIndex, config)

覆盖特定配置:

```javascript
export default antfu()
  .override('antfu/typescript/rules', {
    rules: {
      'ts/no-explicit-any': 'off'
    }
  })

  // 或使用索引
  .override(0, {
    rules: {
      'no-console': 'warn'
    }
  })
```

#### insertAfter(nameOrIndex, ...configs)

在特定配置后插入:

```javascript
export default antfu()
  .insertAfter('antfu/vue/rules', {
    files: ['**/*.vue'],
    rules: {
      'custom-vue-rule': 'error'
    }
  })
```

#### renamePlugins(map)

重命名插件:

```javascript
export default antfu()
  .renamePlugins({
    'ts': 'typescript',
    'style': '@stylistic'
  })
```

### 7.9 细粒度配置导入

对于高级用户,可以直接导入各个配置模块:

```javascript
import {
  combine,
  comments,
  ignores,
  imports,
  javascript,
  jsdoc,
  jsonc,
  markdown,
  node,
  perfectionist,
  sortPackageJson,
  sortTsconfig,
  stylistic,
  typescript,
  unicorn,
  vue,
  yaml
} from '@antfu/eslint-config'

export default await combine(
  ignores(),
  javascript(),
  comments(),
  node(),
  jsdoc(),
  imports(),
  unicorn(),
  typescript({
    tsconfigPath: './tsconfig.json'
  }),
  stylistic({
    indent: 2,
    quotes: 'single'
  }),
  vue({
    vueVersion: 3
  }),
  jsonc(),
  yaml(),
  markdown()
)
```

### 7.10 配置名称

每个配置模块都有一个名称,可以用于覆盖或插入:

```typescript
type ConfigNames =
  | 'antfu/ignores'
  | 'antfu/javascript/setup'
  | 'antfu/javascript/rules'
  | 'antfu/typescript/setup'
  | 'antfu/typescript/rules'
  | 'antfu/typescript/disables'
  | 'antfu/vue/setup'
  | 'antfu/vue/rules'
  | 'antfu/react/setup'
  | 'antfu/react/rules'
  | 'antfu/stylistic/setup'
  | 'antfu/stylistic/rules'
  | 'antfu/jsonc/setup'
  | 'antfu/jsonc/rules'
  | 'antfu/yaml/setup'
  | 'antfu/yaml/rules'
  | 'antfu/markdown/setup'
  | 'antfu/markdown/rules'
  | 'antfu/imports'
  | 'antfu/comments'
  | 'antfu/node'
  | 'antfu/jsdoc'
  | 'antfu/perfectionist'
  // ... 更多
```

---

## 8. 技术栈与依赖管理

### 8.1 核心依赖

#### ESLint 相关

```json
{
  "dependencies": {
    "eslint": "^9.5.0",
    "@eslint/js": "catalog:prod",
    "eslint-plugin-antfu": "catalog:prod"
  }
}
```

#### TypeScript 支持

```json
{
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "catalog:prod",
    "@typescript-eslint/parser": "catalog:prod",
    "eslint-plugin-erasable-syntax-only": "catalog:prod"
  }
}
```

#### Vue 支持

```json
{
  "dependencies": {
    "eslint-plugin-vue": "catalog:prod",
    "vue-eslint-parser": "catalog:prod"
  }
}
```

#### React 支持(可选,需手动安装)

```json
{
  "peerDependencies": {
    "@eslint-react/eslint-plugin": "^1.5.8",
    "eslint-plugin-react-hooks": "^5.1.0 || ^7.0.0",
    "eslint-plugin-react-refresh": "^0.4.4"
  }
}
```

> **注意**: React 相关依赖是 peer dependencies,需要用户手动安装。

#### 格式化支持

```json
{
  "dependencies": {
    "@stylistic/eslint-plugin": "catalog:prod",
    "eslint-plugin-format": "catalog:prod"
  }
}
```

#### 其他插件

```json
{
  "dependencies": {
    "eslint-plugin-import-x": "catalog:prod",
    "eslint-plugin-jsdoc": "catalog:prod",
    "eslint-plugin-jsonc": "catalog:prod",
    "eslint-plugin-markdown": "catalog:prod",
    "eslint-plugin-n": "catalog:prod",
    "eslint-plugin-no-only-tests": "catalog:prod",
    "eslint-plugin-perfectionist": "catalog:prod",
    "eslint-plugin-toml": "catalog:prod",
    "eslint-plugin-unicorn": "catalog:prod",
    "eslint-plugin-unused-imports": "catalog:prod",
    "eslint-plugin-vitest": "catalog:prod",
    "eslint-plugin-yml": "catalog:prod"
  }
}
```

### 8.2 pnpm Catalog 依赖管理

antfu/eslint-config 使用 **pnpm catalog** 协议管理依赖版本。

#### 什么是 pnpm Catalog

pnpm Catalog 是 pnpm 提供的一种集中式依赖版本管理方案,允许在 monorepo 中统一管理包版本。

#### 配置示例

**pnpm-workspace.yaml:**

```yaml
catalogs:
  # 生产依赖
  prod:
    eslint: ^9.5.0
    '@stylistic/eslint-plugin': ^2.12.1
    '@typescript-eslint/eslint-plugin': ^8.15.0
    '@typescript-eslint/parser': ^8.15.0
    'eslint-plugin-vue': ^9.31.0

  # 开发依赖
  dev:
    typescript: ^5.7.2
    vitest: ^2.1.8

  # peer 依赖
  peer:
    '@eslint-react/eslint-plugin': ^1.5.8
    'eslint-plugin-react-hooks': ^7.0.0
```

**package.json:**

```json
{
  "dependencies": {
    "eslint": "catalog:prod",
    "@stylistic/eslint-plugin": "catalog:prod",
    "@typescript-eslint/eslint-plugin": "catalog:prod"
  },
  "devDependencies": {
    "typescript": "catalog:dev",
    "vitest": "catalog:dev"
  },
  "peerDependencies": {
    "@eslint-react/eslint-plugin": "catalog:peer",
    "eslint-plugin-react-hooks": "catalog:peer"
  }
}
```

#### Catalog 的优势

1. **统一版本管理**: 所有包的版本在一处定义
2. **分类清晰**: 通过不同的 catalog(prod, dev, peer)分类依赖
3. **易于升级**: 只需更新 catalog 中的版本
4. **减少冲突**: 避免不同包使用不同版本的依赖

### 8.3 依赖分类

#### 核心依赖(必须)

```json
{
  "dependencies": {
    "eslint": "^9.5.0",
    "@eslint/js": "^9.5.0",
    "eslint-plugin-antfu": "^2.7.0"
  }
}
```

#### 语言支持(自动安装)

```json
{
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "eslint-plugin-vue": "^9.31.0",
    "vue-eslint-parser": "^9.4.3"
  }
}
```

#### 框架支持(按需安装)

- React: 需手动安装 peer dependencies
- Svelte: 需手动安装
- Astro: 需手动安装
- Solid: 需手动安装

#### 格式化支持(可选)

```json
{
  "dependencies": {
    "@stylistic/eslint-plugin": "^2.12.1",
    "eslint-plugin-format": "^0.1.2"
  }
}
```

### 8.4 依赖安装流程

#### 基础安装

```bash
npm install -D @antfu/eslint-config eslint
```

#### 添加 React 支持

```bash
npm install -D @eslint-react/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh
```

#### 添加格式化工具支持

```bash
npm install -D eslint-plugin-format

# 如果使用 Prettier
npm install -D prettier

# 如果使用 dprint
npm install -D @dprint/formatter
```

### 8.5 工具生态集成

#### ESLint Config Inspector

用于可视化查看 ESLint 配置:

```bash
npx eslint --inspect-config
```

这会启动一个本地服务器,展示你的 ESLint 配置。

访问: https://eslint-config.antfu.me/

#### ESLint Flat Config Utils

用于操作 Flat Config 的工具库:

```bash
npm install -D @antfu/eslint-flat-config-utils
```

```typescript
import { combine, concat, renameRules } from '@antfu/eslint-flat-config-utils'
```

#### VS Code ESLint 扩展

确保安装最新版本的 ESLint 扩展:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint"
  ]
}
```

### 8.6 TypeScript 配置

项目使用 TypeScript 编写,提供完整的类型定义:

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 8.7 构建工具

项目使用以下工具进行构建和发布:

- **unbuild**: 用于打包 TypeScript 代码
- **bumpp**: 用于版本管理
- **changelogithub**: 用于生成 changelog

**package.json scripts:**

```json
{
  "scripts": {
    "build": "unbuild",
    "release": "bumpp && pnpm publish",
    "changelog": "changelogithub"
  }
}
```

---

## 9. Prettier vs Stylistic 设计决策

### 9.1 为什么不用 Prettier

Anthony Fu 在他的博客文章 ["Why I don't use Prettier"](https://antfu.me/posts/why-not-prettier) 中详细解释了他的观点。

#### Prettier 的问题

**1. 过度主观的换行决策**

Prettier 基于 `printWidth` (默认 80) 强制换行:

```javascript
// 原始代码
const user = { name: 'Alice', age: 30, email: 'alice@example.com', role: 'admin' }

// Prettier 输出(假设超过 printWidth)
const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
  role: 'admin'
}

// 但如果稍微缩短一点,又会变回一行
const user = { name: 'Alice', age: 30, email: 'alice@example.com' }
```

这导致:
- 小的代码改动可能触发大范围的格式变化
- 产生不稳定的 git diff
- 有时换行反而降低了可读性

**2. 配置受限**

Prettier 的理念是"Opinionated",这意味着:
- 很少的配置选项
- 无法针对特定场景微调
- 必须接受 Prettier 的所有决策

**3. 工具链复杂化**

使用 ESLint + Prettier 需要:
- 配置两套工具
- 处理规则冲突(通过 eslint-config-prettier)
- 在编辑器中配置两个扩展
- 可能的性能问题

**4. AST 重建导致的不一致**

Prettier 读取 AST 后从头重建代码:
- 忽略原始换行
- 可能改变有意义的代码结构
- 在代码审查时产生噪音

### 9.2 ESLint Stylistic 的优势

#### 保留原始换行

```javascript
// 开发者这样写,认为这样更易读
const config = {
  name: 'My App',
  version: '1.0.0',
  dependencies: { vue: '^3.0.0', vite: '^5.0.0' }
}

// Stylistic 保留这个结构,只修复格式问题(如空格、引号等)
const config = {
  name: 'My App',
  version: '1.0.0',
  dependencies: { vue: '^3.0.0', vite: '^5.0.0' },
}

// 而不是强制换行
const config = {
  name: 'My App',
  version: '1.0.0',
  dependencies: {
    vue: '^3.0.0',
    vite: '^5.0.0'
  },
}
```

#### 更细粒度的控制

Stylistic 提供 100+ 个规则,可以精确控制每个格式细节:

```javascript
export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,

    // 对象大括号内空格
    objectCurlySpacing: true,

    // 数组括号内空格
    arrayBracketSpacing: false,

    // 箭头函数括号
    arrowParens: 'as-needed',

    // 逗号位置
    commaDangle: 'always-multiline',

    // 操作符换行位置
    operatorLinebreak: 'before',

    // ... 还有更多
  }
})
```

#### 按文件类型定制

可以为不同文件类型设置不同的格式化规则:

```javascript
export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single'
    }
  },

  // Vue 文件使用不同的缩进
  {
    files: ['**/*.vue'],
    rules: {
      'style/indent': ['error', 4]
    }
  },

  // JSON 文件使用双引号
  {
    files: ['**/*.json'],
    rules: {
      'style/quotes': ['error', 'double']
    }
  }
)
```

#### 统一的工具链

只需要 ESLint,不需要额外的工具:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 9.3 Stylistic 的设计原则

#### Minimal for reading

代码应该易于阅读,不应该被强制换行破坏可读性:

```javascript
// 好的:简洁易读
const point = { x: 10, y: 20 }

// Prettier 可能会:过度换行
const point = {
  x: 10,
  y: 20
}
```

#### Stable for diff

格式化不应该在没有实质性变更时产生 diff:

```javascript
// 添加一个属性
const config = {
  name: 'App',
  version: '1.0.0',
+ debug: true,
}

// Stylistic 只会显示这一行的变化
// 而 Prettier 可能因为长度变化重新格式化整个对象
```

#### Consistent

在项目中保持一致的风格:

```javascript
// 如果开发者在这个文件中使用单行对象
const a = { x: 1, y: 2 }
const b = { x: 3, y: 4 }

// Stylistic 会保持一致性
const c = { x: 5, y: 6 }

// 而不是因为新增一个属性就强制换行
const c = {
  x: 5,
  y: 6,
  z: 7
}
```

### 9.4 什么时候可以使用 Prettier

Anthony Fu 并不完全反对 Prettier,他认为在以下场景可以使用:

#### 1. ESLint 不支持的文件

```javascript
export default antfu({
  formatters: {
    css: 'prettier',      // CSS 使用 Prettier
    html: 'prettier',     // HTML 使用 Prettier
    markdown: 'prettier'  // Markdown 使用 Prettier
  }
})
```

#### 2. 团队偏好

如果团队更喜欢 Prettier 的行为:

```javascript
export default antfu({
  // 禁用 Stylistic
  stylistic: false,

  // 使用 eslint-plugin-format 集成 Prettier
  formatters: {
    javascript: 'prettier',
    typescript: 'prettier'
  }
})
```

#### 3. 混合方案

只使用 Prettier 处理特定文件:

```javascript
export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single'
    }
  },

  // 特定目录使用 Prettier
  {
    files: ['packages/legacy/**/*.js'],
    plugins: {
      format: eslintPluginFormat
    },
    rules: {
      'format/prettier': ['error', {
        printWidth: 80,
        singleQuote: true
      }]
    }
  }
)
```

### 9.5 实际对比

#### 场景 1: 长参数列表

**Prettier:**
```javascript
function createUser(
  name,
  email,
  age,
  role,
  permissions
) {
  // ...
}
```

**Stylistic:**
```javascript
// 如果开发者认为一行更清晰,就保留一行
function createUser(name, email, age, role, permissions) {
  // ...
}

// 如果开发者选择换行,就保留换行
function createUser(
  name,
  email,
  age,
  role,
  permissions
) {
  // ...
}
```

#### 场景 2: 链式调用

**Prettier:**
```javascript
// 可能被强制换行
const result = array
  .map(x => x * 2)
  .filter(x => x > 10)
  .reduce((a, b) => a + b, 0)
```

**Stylistic:**
```javascript
// 尊重开发者的选择
const result = array.map(x => x * 2).filter(x => x > 10).reduce((a, b) => a + b, 0)

// 或者
const result = array
  .map(x => x * 2)
  .filter(x => x > 10)
  .reduce((a, b) => a + b, 0)
```

### 9.6 迁移指南

如果你从 Prettier 迁移到 Stylistic:

#### 1. 移除 Prettier

```bash
npm uninstall prettier eslint-config-prettier eslint-plugin-prettier
```

#### 2. 更新配置

```javascript
// 旧的配置
module.exports = {
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
}

// 新的配置
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false
  }
})
```

#### 3. 更新 VS Code 设置

```json
{
  // 禁用 Prettier
  "prettier.enable": false,

  // 使用 ESLint 格式化
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

#### 4. 初次格式化

第一次运行可能会产生大量变更:

```bash
# 建议先提交现有代码
git add .
git commit -m "chore: prepare for eslint stylistic migration"

# 然后运行格式化
npx eslint . --fix

# 查看变更
git diff

# 如果满意,提交变更
git add .
git commit -m "chore: migrate to eslint stylistic"
```

---

## 10. 最佳实践与实际应用

### 10.1 基础项目配置

#### 小型单页应用

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // 自动检测 TypeScript 和 Vue
  stylistic: {
    indent: 2,
    quotes: 'single'
  },

  // 忽略构建产物
  ignores: ['dist', '.output']
})
```

#### 库项目

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',

  typescript: {
    tsconfigPath: './tsconfig.json'
  },

  // 库项目通常更严格
  lessOpinionated: false
})
```

### 10.2 Monorepo 配置

#### 根目录配置

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,

  // 全局忽略
  ignores: [
    '**/dist',
    '**/node_modules',
    '**/.temp',
    '**/coverage'
  ]
})
```

#### 包特定配置

```javascript
// packages/ui/eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    vueVersion: 3,
    overrides: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase']
    }
  }
})
```

```javascript
// packages/api/eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,

  // API 包允许 console
  rules: {
    'no-console': 'off'
  }
})
```

### 10.3 Next.js 项目

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  nextjs: true,

  typescript: {
    tsconfigPath: './tsconfig.json'
  },

  // Next.js 特定配置
  rules: {
    // 允许 default export for pages
    'import/no-default-export': 'off'
  }
},

// API 路由特定规则
{
  files: ['app/api/**/*.ts', 'pages/api/**/*.ts'],
  rules: {
    'no-console': 'off'
  }
},

// 页面组件规则
{
  files: ['app/**/*.tsx', 'pages/**/*.tsx'],
  rules: {
    'react/prop-types': 'off'
  }
})
```

### 10.4 Vue 3 + TypeScript 项目

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    vueVersion: 3,
    overrides: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-options-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits']
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        }
      }]
    }
  },

  typescript: {
    tsconfigPath: './tsconfig.json',
    overrides: {
      'ts/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }]
    }
  },

  stylistic: {
    indent: 2,
    quotes: 'single'
  }
},

// Composables 特定规则
{
  files: ['**/composables/**/*.ts', '**/composables/**/*.tsx'],
  rules: {
    // Composables 可以有副作用
    'import/no-mutable-exports': 'off'
  }
})
```

### 10.5 测试文件配置

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true
  },

  // 测试文件宽松规则
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    rules: {
      'no-console': 'off',
      'ts/no-explicit-any': 'off',
      'ts/no-non-null-assertion': 'off',
      'antfu/no-top-level-await': 'off'
    }
  },

  // E2E 测试
  {
    files: ['**/*.e2e.ts', '**/e2e/**/*.ts'],
    rules: {
      'no-console': 'off',
      'test/no-disabled-tests': 'warn'
    }
  }
)
```

### 10.6 多框架项目

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    react: true
  },

  // Vue 组件
  {
    files: ['src/vue/**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase']
    }
  },

  // React 组件
  {
    files: ['src/react/**/*.tsx'],
    rules: {
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error'
    }
  },

  // 共享组件
  {
    files: ['src/shared/**/*.ts'],
    rules: {
      // 共享代码必须更严格
      'ts/explicit-function-return-type': 'error'
    }
  }
)
```

### 10.7 CI/CD 集成

#### package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  }
}
```

#### GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Install dependencies
        run: pnpm install

      - name: Run ESLint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check
```

#### 提交前检查

```json
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx,vue}": [
      "eslint --fix"
    ]
  }
}
```

安装:

```bash
npm install -D simple-git-hooks lint-staged
npx simple-git-hooks
```

### 10.8 编辑器配置

#### VS Code

```json
// .vscode/settings.json
{
  // 禁用 Prettier
  "prettier.enable": false,

  // 使用 ESLint 格式化
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  // 验证文件类型
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml"
  ],

  // 静默样式规则(不在编辑器显示,但保存时修复)
  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ]
}
```

#### JetBrains IDEs (WebStorm, IntelliJ IDEA)

1. 打开 Preferences > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint
2. 选择 "Automatic ESLint configuration"
3. 勾选 "Run eslint --fix on save"

### 10.9 常见问题解决

#### 问题 1: 规则冲突

如果遇到规则冲突,使用 `override()` 解决:

```javascript
export default antfu()
  .override('antfu/typescript/rules', {
    rules: {
      'ts/no-explicit-any': 'off'
    }
  })
```

#### 问题 2: 性能问题

对于大型项目,可以优化性能:

```javascript
export default antfu({
  typescript: {
    // 限制类型检查的文件
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname
    }
  },

  // 禁用某些耗时的规则
  rules: {
    'import/no-cycle': 'off'
  }
})
```

#### 问题 3: 自动导入冲突

如果使用 unplugin-auto-import:

```javascript
// eslint.config.js
export default antfu({
  vue: true
})

// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'

export default {
  plugins: [
    AutoImport({
      eslintrc: {
        enabled: true  // 生成 .eslintrc-auto-import.json
      }
    })
  ]
}

// 然后在 eslint.config.js 中导入
import autoImport from './.eslintrc-auto-import.json'

export default antfu(
  { vue: true },
  autoImport
)
```

### 10.10 迁移现有项目

#### 步骤 1: 安装依赖

```bash
# 移除旧配置
npm uninstall eslint-config-* eslint-plugin-*

# 安装新配置
npm install -D @antfu/eslint-config eslint
```

#### 步骤 2: 创建新配置文件

```javascript
// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  // 根据项目需求配置
})
```

#### 步骤 3: 删除旧配置文件

```bash
rm .eslintrc.* .prettierrc.*
```

#### 步骤 4: 更新 package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

#### 步骤 5: 首次格式化

```bash
npm run lint:fix
```

#### 步骤 6: 提交变更

```bash
git add .
git commit -m "chore: migrate to @antfu/eslint-config"
```

### 10.11 性能优化建议

#### 1. 限制类型检查范围

```javascript
export default antfu({
  typescript: {
    parserOptions: {
      project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      tsconfigRootDir: __dirname
    }
  }
})
```

#### 2. 使用缓存

```json
{
  "scripts": {
    "lint": "eslint . --cache"
  }
}
```

#### 3. 并行检查

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit",
    "check": "run-p lint type-check"
  }
}
```

---

## 总结

**antfu/eslint-config** 是一个设计精良、高度可配置的 ESLint 配置预设,它的核心优势包括:

### 设计亮点

1. **完全拥抱 Flat Config**: 充分利用 ESLint 9+ 的新配置格式,提供更好的组织性和可组合性

2. **模块化架构**: 清晰的模块划分,每个配置模块职责单一,可独立使用或组合

3. **智能自动检测**: TypeScript 和 Vue 自动检测,减少手动配置

4. **统一的工具链**: 使用 ESLint Stylistic 替代 Prettier,实现格式化和校验的统一

5. **灵活的可配置性**: 多层次的配置能力,从简单的选项到高级的 Composer API

6. **类型安全**: 完整的 TypeScript 类型定义,提供优秀的开发体验

7. **现代依赖管理**: 使用 pnpm catalog 实现集中式版本管理

### 适用场景

- 单页应用(Vue、React、Svelte等)
- 库和组件开发
- Monorepo 项目
- 全栈应用(Next.js、Nuxt等)
- CLI 工具

### 核心理念

- **Minimal for reading**: 代码应该易于阅读
- **Stable for diff**: 格式化应该产生稳定的 diff
- **Consistent**: 保持项目中的一致性

### 学习资源

- **GitHub 仓库**: https://github.com/antfu/eslint-config
- **配置查看器**: https://eslint-config.antfu.me/
- **博客文章**: https://antfu.me/posts/why-not-prettier
- **演讲**: https://gitnation.com/contents/eslint-one-for-all-made-easy

通过深入研究 antfu/eslint-config,我们可以学到很多关于 ESLint 配置设计、工具链整合和开源项目维护的宝贵经验。无论是直接使用这个配置,还是基于它开发自己的配置,都能从中获得很多启发。
