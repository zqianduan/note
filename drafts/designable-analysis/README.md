# Designable 深度解析

> 从源码层面深入分析 Designable 低代码设计器引擎的架构设计和实现原理

## 📁 项目结构

```
designable-analysis/
├── README.md                    # 本文件（项目导航）
├── PROJECT-SUMMARY.md           # 项目总结报告
├── docs/                        # 深度解析文档
│   ├── 01-整体架构解析.md
│   ├── 02-shared包详解.md
│   ├── 03-core包详解.md
│   ├── 04-react包详解.md
│   ├── 05-formily-transformer包详解.md
│   └── 06-react-settings-form包详解.md
└── demo/                        # 示例代码
    ├── README.md
    ├── package.json
    ├── index.html
    └── src/
```

## 🚀 快速开始

### 1. 阅读文档

**推荐阅读顺序**（初学者）：
```
docs/01-整体架构解析.md（理解整体架构）
  ↓
docs/02-shared包详解.md（学习基础工具）
  ↓
docs/03-core包详解.md（深入核心引擎）
  ↓
docs/04-react包详解.md（理解 UI 集成）
  ↓
运行 Demo（实践）
```

### 2. 运行 Demo

```bash
cd demo
npm install
npm run dev
```

浏览器访问 `http://localhost:3000` 查看表单设计器示例。

## 📚 文档目录

### 基础篇

| 文档 | 内容 | 适合人群 |
|------|------|---------|
| [01-整体架构解析](docs/01-整体架构解析.md) | 分层架构、设计模式、核心模型、事件驱动系统 | 所有读者 ⭐ |
| [02-shared包详解](docs/02-shared包详解.md) | 基础工具库、事件系统、LRU 缓存、性能优化 | 想理解基础的读者 |

### 核心篇

| 文档 | 内容 | 适合人群 |
|------|------|---------|
| [03-core包详解](docs/03-core包详解.md) | 核心模型、Driver 系统、Effect 系统、GlobalRegistry | 想深入引擎的读者 |
| [04-react包详解](docs/04-react包详解.md) | React 集成、Hooks、容器组件、Widget、Panel | 想理解 UI 的读者 |

### 集成篇

| 文档 | 内容 | 适合人群 |
|------|------|---------|
| [05-formily-transformer包详解](docs/05-formily-transformer包详解.md) | TreeNode ↔ Formily Schema 双向转换 | 想理解集成的读者 |
| [06-react-settings-form包详解](docs/06-react-settings-form包详解.md) | 设置表单、动态表单、自定义设置器 | 想扩展功能的读者 |

## 🎯 核心概念速查

### 架构设计

- **分层架构**：shared（工具层）→ core（引擎层）→ react（UI 层）→ formily（集成层）
- **事件驱动**：Driver（事件驱动器）→ Event（自定义事件）→ Effect（副作用处理）
- **响应式系统**：基于 @formily/reactive 实现的响应式状态管理

### 6 大设计模式

| 模式 | 应用 | 位置 |
|------|------|------|
| 观察者模式 | 事件系统、响应式 | shared/core |
| 组合模式 | TreeNode 树结构 | core |
| 策略模式 | Driver 系统 | core |
| 注册表模式 | GlobalRegistry | core |
| 命令模式 | History 系统 | core |
| 工厂模式 | Engine 创建模型 | core |

### 核心模型

| 模型 | 职责 |
|------|------|
| Engine | 引擎控制器，管理整个设计器生命周期 |
| TreeNode | 树节点，设计树的基本单元 |
| Workspace | 工作区，管理单个设计器实例 |
| Selection | 选择管理，处理节点选中状态 |
| History | 历史记录，支持撤销/重做 |
| Viewport | 视口管理，处理画布区域 |

## 💡 学习路径

### 路径 1：初学者（理论 + 实践）

1. 阅读 [01-整体架构解析](docs/01-整体架构解析.md) - 理解整体设计
2. 阅读 [02-shared包详解](docs/02-shared包详解.md) - 学习基础工具
3. 运行 Demo - 实践操作
4. 阅读 [03-core包详解](docs/03-core包详解.md) - 深入核心
5. 阅读 [04-react包详解](docs/04-react包详解.md) - 理解 UI

### 路径 2：进阶开发者（深入源码）

1. 阅读 [01-整体架构解析](docs/01-整体架构解析.md) - 快速了解
2. 阅读 [03-core包详解](docs/03-core包详解.md) - 核心实现
3. 阅读 [05-formily-transformer包详解](docs/05-formily-transformer包详解.md) - 集成机制
4. 源码阅读 - 深入研究

### 路径 3：实战开发（快速上手）

1. 阅读 [01-整体架构解析](docs/01-整体架构解析.md) - 了解架构
2. 阅读 [04-react包详解](docs/04-react包详解.md) - 学习组件
3. 运行 Demo - 实践
4. 自定义组件开发 - 扩展

## 📊 项目统计

- **文档数量**：6 篇深度解析 + 1 篇总结
- **文档大小**：约 135KB+
- **代码示例**：50+ 个
- **分析的包**：6 个核心包
- **分析的模型**：15+ 个
- **分析的组件**：50+ 个

## 🔧 常见问题

**Q: 如何调试 Designable？**
- 使用 React DevTools 查看组件树
- 访问 `window.__DESIGNABLE_ENGINE__` 获取引擎实例
- 添加事件监听观察数据变化

**Q: 如何扩展自定义组件？**
- 参考 [04-react包详解](docs/04-react包详解.md) 的"自定义组件"章节

**Q: 如何实现自定义设置器？**
- 参考 [06-react-settings-form包详解](docs/06-react-settings-form包详解.md) 的"自定义设置器"章节

**Q: 性能优化有哪些技巧？**
- 参考 [01-整体架构解析](docs/01-整体架构解析.md) 的"性能优化策略"章节

## 📚 参考资源

### 官方资源
- [Designable GitHub](https://github.com/alibaba/designable)
- [Formily 官方文档](https://formilyjs.org/)
- [Ant Design 官方文档](https://ant.design/)

### 相关技术
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

### 源码位置
- Designable 源码：`/Users/xiejiancong/Desktop/workspace/Github/designable`

## 📝 更新日志

- **2026-02-07**: 重新组织目录结构，统一到 designable-analysis 文件夹
- **2026-02-06**: 完成所有文档和 Demo 示例

## 📄 许可证

MIT License

---

**文档版本**: 1.0.0
**Designable 版本**: 1.0.0-beta.45
**最后更新**: 2026-02-07

---

💡 **提示**: 建议先阅读 [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) 了解项目全貌，再根据学习路径深入学习。
