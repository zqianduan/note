# Designable 深度解析 - 项目结构说明

## 📁 目录结构

```
designable-analysis/
├── README.md                           # 项目导航（快速开始、学习路径）
├── PROJECT-SUMMARY.md                  # 项目总结报告（完整的项目说明）
│
├── docs/                               # 深度解析文档目录
│   ├── 01-整体架构解析.md               # 分层架构、设计模式、核心模型
│   ├── 02-shared包详解.md              # 基础工具库、事件系统、性能优化
│   ├── 03-core包详解.md                # 核心引擎、Driver、Effect 系统
│   ├── 04-react包详解.md               # React 集成、Hooks、组件
│   ├── 05-formily-transformer包详解.md # TreeNode ↔ Schema 转换
│   └── 06-react-settings-form包详解.md # 设置表单、动态表单
│
└── demo/                               # 示例代码目录
    ├── README.md                       # Demo 使用说明
    ├── package.json                    # 项目配置
    ├── vite.config.js                  # Vite 配置
    ├── index.html                      # HTML 入口
    └── src/                            # 源代码
        ├── main.jsx                    # 应用入口
        ├── App.jsx                     # 主应用组件
        └── App.css                     # 样式文件
```

## 📖 文件说明

### 根目录文件

| 文件 | 说明 | 大小 |
|------|------|------|
| [README.md](README.md) | 项目导航，包含快速开始、学习路径、核心概念速查 | ~10KB |
| [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | 项目总结报告，包含完整的项目说明和统计数据 | ~15KB |

### docs/ 文档目录

| 文档 | 说明 | 大小 | 代码示例 |
|------|------|------|---------|
| [01-整体架构解析.md](docs/01-整体架构解析.md) | 整体架构、6 大设计模式、7 大核心模型 | ~20KB | 15+ |
| [02-shared包详解.md](docs/02-shared包详解.md) | 13 个核心模块、性能优化技巧 | ~15KB | 20+ |
| [03-core包详解.md](docs/03-core包详解.md) | 核心模型、Driver 系统、Effect 系统 | ~25KB | 15+ |
| [04-react包详解.md](docs/04-react包详解.md) | React 集成、28+ Hooks、50+ 组件 | ~30KB | 20+ |
| [05-formily-transformer包详解.md](docs/05-formily-transformer包详解.md) | 双向转换机制、序列化/反序列化 | ~15KB | 10+ |
| [06-react-settings-form包详解.md](docs/06-react-settings-form包详解.md) | 设置表单、23 个内置组件、自定义设置器 | ~20KB | 15+ |

### demo/ 示例目录

| 文件 | 说明 |
|------|------|
| [README.md](demo/README.md) | Demo 使用说明，包含功能特性、使用技巧、常见问题 |
| package.json | 项目依赖配置 |
| vite.config.js | Vite 构建配置 |
| index.html | HTML 入口文件 |
| src/main.jsx | React 应用入口 |
| src/App.jsx | 主应用组件（表单设计器） |
| src/App.css | 样式文件 |

## 🚀 快速导航

### 从哪里开始？

1. **完全新手**：先阅读 [README.md](README.md) 了解项目概况
2. **想快速上手**：直接运行 [demo](demo/) 查看效果
3. **想深入学习**：按顺序阅读 [docs](docs/) 目录下的文档
4. **想了解全貌**：阅读 [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)

### 推荐阅读顺序

**初学者路径**：
```
README.md → docs/01-整体架构解析.md → docs/02-shared包详解.md
→ 运行 demo → docs/03-core包详解.md → docs/04-react包详解.md
```

**进阶路径**：
```
README.md → docs/01-整体架构解析.md → docs/03-core包详解.md
→ docs/05-formily-transformer包详解.md → 源码阅读
```

**实战路径**：
```
README.md → docs/04-react包详解.md → 运行 demo → 自定义组件开发
```

## 📊 统计数据

### 文档统计

- **文档总数**：6 篇深度解析 + 2 篇说明文档
- **文档总大小**：约 150KB
- **代码示例**：95+ 个
- **涵盖的包**：6 个核心包
- **分析的模型**：15+ 个
- **分析的组件**：50+ 个

### Demo 统计

- **代码行数**：约 200 行
- **功能特性**：7 个核心功能
- **技术栈**：React + Designable + Formily + Ant Design + Vite

## 🎯 核心内容

### 架构设计

- **分层架构**：4 层架构设计（工具层、引擎层、UI 层、集成层）
- **设计模式**：6 大设计模式（观察者、组合、策略、注册表、命令、工厂）
- **事件驱动**：完整的事件驱动系统（Driver → Event → Effect）
- **响应式系统**：基于 @formily/reactive 的响应式状态管理

### 核心模型

- **Engine**：引擎控制器
- **TreeNode**：树节点（设计树的基本单元）
- **Workspace**：工作区管理
- **Selection**：选择管理
- **History**：历史记录（撤销/重做）
- **Viewport**：视口管理

### React 集成

- **28+ Hooks**：完整的 Hooks 系统
- **10+ 容器组件**：Designer、Workspace、Viewport 等
- **18+ Widget 组件**：AuxTool、ComponentTree、Outline 等
- **7+ Panel 组件**：CompositePanel、SettingsPanel 等

## 📝 使用建议

### 阅读文档

1. **先看概览**：阅读 README.md 了解整体结构
2. **理解架构**：阅读 01-整体架构解析.md 理解设计思想
3. **学习基础**：阅读 02-shared包详解.md 学习基础工具
4. **深入核心**：阅读 03-core包详解.md 理解核心引擎
5. **实践应用**：运行 demo 并尝试修改

### 运行 Demo

```bash
cd demo
npm install
npm run dev
```

浏览器访问 `http://localhost:3000` 查看表单设计器。

### 源码阅读

配合文档阅读 Designable 源码：
- 源码位置：`/Users/xiejiancong/Desktop/workspace/Github/designable`
- 使用 IDE 的跳转功能追踪代码
- 添加 console.log 观察数据流动
- 使用 React DevTools 观察组件树

## 🔗 相关链接

- [Designable GitHub](https://github.com/alibaba/designable)
- [Formily 官方文档](https://formilyjs.org/)
- [Ant Design 官方文档](https://ant.design/)

## 📄 许可证

MIT License

---

**最后更新**: 2026-02-07
**文档版本**: 1.0.0
