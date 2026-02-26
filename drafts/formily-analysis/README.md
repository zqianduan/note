# Formily 深度分析文档

> 这是一个全面深入分析 Formily v2.x 表单解决方案的文档集合，包含核心概念、设计原理、源码分析和实战案例。

## 📚 文档目录

### 核心文档

- **[01. Formily Core 设计详解](./docs/01-formily-core.md)** ⭐⭐
  - Form 模型（创建、属性、方法）
  - Field 模型（类型、状态、操作）
  - Effects 副作用机制（生命周期 Hooks、实战案例）
  - Reactions 联动机制
  - Validator 校验引擎
  - 生命周期系统
  - 路径系统
  - 响应式系统集成

- **[02. JSON Schema 设计详解](./docs/02-formily-json-schema.md)** ⭐
  - ISchema 类型系统
  - createSchemaField 实现原理
  - x-decorator 和 x-component 设计
  - x-reactions 联动机制（重点）
  - x-validator 校验设计
  - Schema 表达式系统
  - 数组/对象/void 字段设计
  - 实战案例分析（电商订单、表格编辑）

- **[03. x-reactions 联动机制](./docs/03-formily-x-reactions.md)**
  - Reactions 设计原理
  - 依赖追踪机制
  - 表达式编译与执行
  - 常见联动场景实现

- **[04. Formily React 设计详解](./docs/04-formily-react.md)** ⭐⭐
  - 设计理念与分层架构
  - Provider/Consumer 模式
  - connect 连接器原理
  - mapProps 映射器设计
  - 组件库绑定机制（重点）
  - Hooks 体系（useForm、useField等）
  - SchemaField 渲染器原理
  - 实战案例（绑定第三方组件）

### 示例代码

- **[examples/formily-demo/](./examples/formily-demo/)** - 完整的 Demo 项目
  - [02-ArrayField.tsx](./examples/formily-demo/src/examples/02-ArrayField.tsx) - 数组字段 Schema 模式
  - [04-VoidField.tsx](./examples/formily-demo/src/examples/04-VoidField.tsx) - void 字段 Schema 模式
  - [06-FormEffects.tsx](./examples/formily-demo/src/examples/06-FormEffects.tsx) - 字段联动 Schema 模式
  - [08-JsonSchema.tsx](./examples/formily-demo/src/examples/08-JsonSchema.tsx) - JSON Schema 基础示例
  - [10-ComplexForm.tsx](./examples/formily-demo/src/examples/10-ComplexForm.tsx) - 电商订单综合示例
  - [11-EffectsDemo.tsx](./examples/formily-demo/src/examples/11-EffectsDemo.tsx) - Effects 机制深度演示 ⭐
  - [12-ReactBinding.tsx](./examples/formily-demo/src/examples/12-ReactBinding.tsx) - React 组件库绑定示例 ⭐⭐

### 源码分析

- **[source-code/formily-reactions-impl.ts](./source-code/formily-reactions-impl.ts)** - Reactions 核心实现源码分析

## 🎯 快速开始

### 运行示例项目

```bash
# 进入示例项目目录
cd examples/formily-demo

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3001 查看所有示例。

### 阅读顺序建议

如果你是 Formily 初学者，建议按以下顺序阅读：

1. **了解 JSON Schema 基础** → [02-formily-json-schema.md](./docs/02-formily-json-schema.md) 前 4 章
2. **运行示例项目** → 查看 [08-JsonSchema.tsx](./examples/formily-demo/src/examples/08-JsonSchema.tsx)
3. **深入 x-reactions** → [02-formily-json-schema.md](./docs/02-formily-json-schema.md) 第 5 章
4. **实战案例学习** → 查看 [10-ComplexForm.tsx](./examples/formily-demo/src/examples/10-ComplexForm.tsx)
5. **学习 Core 层设计** → [01-formily-core.md](./docs/01-formily-core.md)
6. **掌握 React 集成** → [04-formily-react.md](./docs/04-formily-react.md)
7. **实践组件绑定** → 查看 [12-ReactBinding.tsx](./examples/formily-demo/src/examples/12-ReactBinding.tsx)
8. **源码分析** → [03-formily-x-reactions.md](./docs/03-formily-x-reactions.md)

## 🔍 核心概念速查

### ISchema 核心字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 字段类型：string/number/boolean/object/array/void |
| `title` | string | 字段标题 |
| `required` | boolean | 是否必填 |
| `'x-component'` | string | 渲染组件名称 |
| `'x-decorator'` | string | 装饰器组件（如 FormItem） |
| `'x-reactions'` | object | 字段联动逻辑 |
| `'x-validator'` | array | 校验规则 |
| `properties` | object | 子属性（用于 object/void） |
| `items` | object | 数组项 Schema（用于 array） |

### x-reactions 结构

```typescript
{
  dependencies: ['.fieldName'],        // 依赖的字段路径
  when: '{{condition}}',              // 触发条件
  fulfill: {
    state: { ... },                   // 更新字段状态
    schema: { ... },                  // 更新 Schema
    run: '{{code}}'                   // 执行自定义逻辑
  }
}
```

### 表达式变量

| 变量 | 说明 |
|------|------|
| `$self` | 当前字段对象 |
| `$deps` | 依赖字段的值数组 |
| `$form` | 表单实例 |
| `$values` | 表单所有值 |
| `$scope` | 作用域变量 |

## 📖 典型场景示例

### 1. 条件显示

```typescript
{
  name: 'companyName',
  'x-reactions': {
    dependencies: ['.userType'],
    fulfill: {
      state: {
        visible: "{{$deps[0] === 'enterprise'}}"
      }
    }
  }
}
```

### 2. 级联选择

```typescript
{
  name: 'city',
  'x-reactions': [
    {
      // 清空城市值
      dependencies: ['.province'],
      fulfill: {
        state: { value: '{{undefined}}' }
      }
    },
    {
      // 更新城市选项
      dependencies: ['.province'],
      fulfill: {
        schema: {
          'x-component-props': {
            options: "{{getCitiesByProvince($deps[0])}}"
          }
        }
      }
    }
  ]
}
```

### 3. 自动计算

```typescript
{
  name: 'totalPrice',
  'x-reactions': {
    dependencies: ['.quantity', '.unitPrice'],
    fulfill: {
      run: '{{$self.value = ($deps[0] || 0) * ($deps[1] || 0)}}'
    }
  }
}
```

### 4. 数组字段联动

```typescript
{
  name: 'products',
  type: 'array',
  'x-reactions': [{
    when: '{{true}}',
    fulfill: {
      run: `{{
        const items = $self.value || [];
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        $form.setFieldState('totalAmount', state => {
          state.value = total;
        });
      }}`
    }
  }]
}
```

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────┐
│                   Formily 架构                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │      @formily/json-schema                  │    │
│  │  • ISchema 类型定义                        │    │
│  │  • createSchemaField 工厂函数              │    │
│  │  • 表达式编译器                            │    │
│  │  • Schema 递归解析器                       │    │
│  └────────────────────────────────────────────┘    │
│                       ▲                             │
│                       │                             │
│  ┌────────────────────┴────────────────────────┐   │
│  │         @formily/core                       │   │
│  │  • Form 表单模型                            │   │
│  │  • Field 字段模型                           │   │
│  │  • Reactions 联动引擎                       │   │
│  │  • Validator 校验引擎                       │   │
│  └────────────────────────────────────────────┘   │
│                       ▲                             │
│                       │                             │
│  ┌────────────────────┴────────────────────────┐   │
│  │         @formily/react                      │   │
│  │  • FormProvider                             │   │
│  │  • Field / ArrayField / ObjectField         │   │
│  │  • useField / useForm                       │   │
│  └────────────────────────────────────────────┘   │
│                       ▲                             │
│                       │                             │
│  ┌────────────────────┴────────────────────────┐   │
│  │         @formily/antd                       │   │
│  │  • FormItem 装饰器                          │   │
│  │  • Input / Select / DatePicker 等组件适配   │   │
│  │  • FormTab / FormGrid / ArrayItems 等布局   │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 💡 设计亮点

### 1. 声明式配置

通过 JSON Schema 将表单从 JSX 命令式编程转换为声明式配置，支持：
- 配置存储（数据库/文件）
- 动态生成（后端控制）
- 跨平台复用
- 可视化编辑

### 2. 强大的联动机制

x-reactions 提供声明式的字段联动：
- 依赖追踪（dependencies）
- 条件触发（when）
- 状态更新（state）
- Schema 更新（schema）
- 自定义逻辑（run）

### 3. 表达式系统

`{{}}` 模板字符串支持动态计算：
- 访问表单数据
- 调用作用域函数
- 执行复杂逻辑
- 类型安全

### 4. 递归结构

支持任意深度的嵌套：
- 对象嵌套对象
- 数组嵌套对象
- void 布局嵌套
- 混合嵌套

### 5. 组件解耦

Schema 与组件实现分离：
- 组件可替换
- 支持自定义组件
- 跨 UI 框架（React/Vue）

## 🎓 学习路径

### 初级（1-2天）

- [x] 理解 ISchema 基本结构
- [x] 掌握 x-component 和 x-decorator 用法
- [x] 学会基础的 x-reactions（visible、required）
- [x] 运行并理解示例 08

### 中级（3-5天）

- [x] 深入 x-reactions 各种用法
- [x] 掌握数组字段（ArrayItems/ArrayTable）
- [x] 理解 void 字段的应用场景
- [x] 实现级联选择、自动计算
- [x] 学习 @formily/core Effects 机制
- [x] 掌握 @formily/react 基础 API
- [x] 运行并理解示例 02、04、06、11

### 高级（1周+）

- [x] 理解 Reactions 实现原理
- [x] 掌握复杂表达式编写
- [x] 深入 connect/mapProps 机制
- [x] 掌握组件库绑定技巧
- [x] 性能优化技巧
- [x] 构建表单设计器
- [x] 运行并理解示例 10、12（综合案例）

## 📦 技术栈

- **Formily**: v2.x
- **React**: 17.0.2
- **TypeScript**: 5.x
- **Ant Design**: 4.x
- **Vite**: 5.x

## 🔗 相关资源

- [Formily 官方文档](https://formilyjs.org/)
- [Formily GitHub](https://github.com/alibaba/formily)
- [JSON Schema 规范](https://json-schema.org/)
- [Ant Design](https://ant.design/)

## 📝 文档更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-01-07 | v1.3 | 新增 @formily/react 设计文档和组件库绑定示例 |
| 2025-01-05 | v1.2 | 新增 @formily/core 设计文档和 Effects 机制示例 |
| 2025-01-05 | v1.1 | 整理目录结构，移动文件到 docs/、examples/、source-code/ |
| 2025-01-05 | v1.0 | 初始版本，包含 JSON Schema 设计详解 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

文档编写规范：
1. 使用 Markdown 格式
2. 代码示例要完整可运行
3. 添加必要的注释说明
4. 保持文档结构清晰

## 📄 许可证

MIT

---

**维护者**: Claude Code AI Assistant
**最后更新**: 2025-01-05
