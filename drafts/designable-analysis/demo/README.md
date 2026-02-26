# Designable Formily Antd Demo

这是基于 Designable 官方 `formily/antd/playground` 改造的完整表单设计器示例，使用 Vite + pnpm 进行开发调试。

## 项目说明

本项目直接使用了 Designable 官方的完整示例代码，仅对构建工具进行了改造：
- ✅ 从 Webpack 改造为 Vite
- ✅ 使用 pnpm 管理依赖
- ✅ 保留了所有原始功能和代码逻辑
- ✅ 支持 TypeScript
- ✅ 修复了 Less 编译问题

## 功能特性

- ✅ 完整的表单设计器界面
- ✅ 丰富的组件库（输入控件、布局组件、自增组件、展示组件）
- ✅ 拖拽式设计
- ✅ 组件树和大纲视图
- ✅ 属性配置面板
- ✅ 多视图切换（设计视图、JSON Schema、代码视图、预览）
- ✅ 历史记录（撤销/重做）
- ✅ Schema 导入导出
- ✅ 实时预览

## 快速开始

### 1. 安装 pnpm（如果还没有）

```bash
npm install -g pnpm
```

### 2. 安装依赖

```bash
cd demo
pnpm install
```

**注意**：项目已配置 `.npmrc` 文件来处理 peer dependency 问题，无需额外参数。

### 3. 启动开发服务器

```bash
pnpm run dev
```

启动成功后，浏览器访问 `http://localhost:3000`

### 4. 构建生产版本

```bash
pnpm run build
```

### 5. 预览生产版本

```bash
pnpm run preview
```

## 项目结构

```
demo/
├── .npmrc                  # pnpm 配置
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── pnpm-lock.yaml          # pnpm 锁文件
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node TypeScript 配置
└── src/
    ├── main.tsx            # 应用入口（来自官方 playground）
    ├── widgets/            # 自定义 Widget 组件
    │   ├── ActionsWidget.tsx
    │   ├── LogoWidget.tsx
    │   ├── PreviewWidget.tsx
    │   ├── SchemaEditorWidget.tsx
    │   └── MarkupSchemaWidget.tsx
    └── service/            # 服务层
        └── schema.ts       # Schema 保存服务
```

## 技术栈

- **React 17**: UI 框架
- **TypeScript**: 类型系统
- **Vite**: 构建工具
- **pnpm**: 包管理器
- **Designable**: 设计器引擎
- **Formily**: 表单解决方案
- **Ant Design 4**: UI 组件库
- **Less**: CSS 预处理器

## 核心配置

### .npmrc 配置

```ini
# 使用 pnpm 的严格 peer dependencies 模式
strict-peer-dependencies=false
auto-install-peers=true
```

### Vite 配置（vite.config.ts）

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        paths: [
          path.resolve(__dirname, 'node_modules')
        ]
      }
    }
  },
  resolve: {
    alias: [
      {
        find: /^~antd/,
        replacement: path.resolve(__dirname, 'node_modules/antd')
      },
      {
        find: /^~/,
        replacement: path.resolve(__dirname, 'node_modules')
      }
    ]
  }
})
```

## 依赖管理

### 为什么使用 pnpm？

1. **节省磁盘空间**：pnpm 使用硬链接和符号链接，避免重复安装
2. **更快的安装速度**：并行安装和更好的缓存机制
3. **严格的依赖管理**：避免幽灵依赖问题
4. **更好的 monorepo 支持**：原生支持 workspace

### 常用命令

```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add <package>

# 添加开发依赖
pnpm add -D <package>

# 删除依赖
pnpm remove <package>

# 更新依赖
pnpm update

# 查看依赖树
pnpm list

# 清理缓存
pnpm store prune
```

## 与官方示例的区别

| 项目 | 官方示例 | 本 Demo |
|------|---------|---------|
| 构建工具 | Webpack | Vite |
| 包管理器 | npm/yarn | pnpm |
| 配置文件 | webpack.*.ts | vite.config.ts |
| 开发服务器 | webpack-dev-server | Vite Dev Server |
| 热更新 | Webpack HMR | Vite HMR |
| 构建速度 | 较慢 | 快速 |
| 依赖管理 | node_modules 扁平化 | pnpm 符号链接 |
| 代码逻辑 | 原始代码 | 完全保留 |

## 常见问题

### Q1: 为什么要使用 pnpm？

**A**: pnpm 提供了更快的安装速度、更少的磁盘占用和更严格的依赖管理。

### Q2: pnpm 安装依赖时有警告？

**A**: 这是正常的 peer dependency 警告，已通过 `.npmrc` 配置处理，不影响使用。

### Q3: Less 编译错误？

**A**: 已在 `vite.config.ts` 中配置了 Less 别名解析，如果仍有问题，清除缓存：
```bash
rm -rf node_modules/.vite
pnpm run dev
```

### Q4: 端口被占用？

**A**: 修改 `vite.config.ts` 中的端口：
```typescript
server: {
  port: 3001  // 改为其他端口
}
```

### Q5: 如何切换回 npm？

**A**: 删除 `pnpm-lock.yaml` 和 `.npmrc`，然后使用 `npm install --legacy-peer-deps`

## 组件说明

### 输入控件

- Input（输入框）
- Password（密码框）
- NumberPicker（数字输入）
- Select（下拉选择）
- TreeSelect（树形选择）
- Cascader（级联选择）
- Radio（单选框）
- Checkbox（复选框）
- DatePicker（日期选择）
- TimePicker（时间选择）
- Upload（文件上传）
- Switch（开关）
- Slider（滑块）
- Rate（评分）
- Transfer（穿梭框）

### 布局组件

- Card（卡片）
- Space（间距）
- FormLayout（表单布局）
- FormGrid（表单网格）
- FormTab（表单标签页）
- FormCollapse（表单折叠面板）
- ObjectContainer（对象容器）

### 自增组件

- ArrayCards（卡片列表）
- ArrayTable（表格列表）

### 展示组件

- Text（文本）

## 开发建议

1. **修改组件**：所有组件来自 `@designable/formily-antd`，不要修改 node_modules
2. **添加自定义组件**：参考官方文档注册自定义组件
3. **调试**：使用浏览器 DevTools 和 React DevTools
4. **性能优化**：Vite + pnpm 已提供了很好的开发体验

## 相关资源

- [Designable GitHub](https://github.com/alibaba/designable)
- [Formily 官方文档](https://formilyjs.org/)
- [Ant Design 官方文档](https://ant.design/)
- [Vite 官方文档](https://vitejs.dev/)
- [pnpm 官方文档](https://pnpm.io/)

## 许可证

MIT

---

**提示**: 这是一个完整的生产级示例，包含了 Designable 的所有核心功能。使用 pnpm 可以获得更好的开发体验。
