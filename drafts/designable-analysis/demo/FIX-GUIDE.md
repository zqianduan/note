# Demo 改造说明

## 改造概述

本 Demo 基于 Designable 官方的 `formily/antd/playground` 示例改造而成，将构建工具从 Webpack 改为 Vite，并使用 pnpm 管理依赖。

## 改造内容

### 1. 复制官方示例代码

```bash
cp -r /path/to/designable/formily/antd/playground/* demo/src/
```

### 2. 修改导入路径

将 `main.tsx` 中的相对导入改为从 npm 包导入：

```typescript
// 修改前
import { Form, Field, ... } from '../src'

// 修改后
import { Form, Field, ... } from '@designable/formily-antd'
```

### 3. 创建 Vite 配置

创建 `vite.config.ts`，配置 Less 和别名：

```typescript
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        paths: [path.resolve(__dirname, 'node_modules')]
      }
    }
  },
  resolve: {
    alias: [
      { find: /^~antd/, replacement: path.resolve(__dirname, 'node_modules/antd') },
      { find: /^~/, replacement: path.resolve(__dirname, 'node_modules') }
    ]
  }
})
```

### 4. 创建 TypeScript 配置

- `tsconfig.json`: 应用配置
- `tsconfig.node.json`: Vite 配置文件的配置

### 5. 创建 .npmrc 配置

```ini
# 使用 pnpm 的严格 peer dependencies 模式
strict-peer-dependencies=false
auto-install-peers=true
```

### 6. 更新 package.json

添加必要的依赖：
- Vite 相关包
- TypeScript 相关包
- 所有 Designable 和 Formily 包
- `@ant-design/icons@^4.8.0`（必须是 4.x 版本）
- `@formily/shared`（widgets 需要）

### 7. 创建 index.html

简单的 HTML 入口文件，引用 `src/main.tsx`

## 关键配置

### Less 别名解析

```typescript
css: {
  preprocessorOptions: {
    less: {
      javascriptEnabled: true,
      paths: [path.resolve(__dirname, 'node_modules')]
    }
  }
}
```

### 正则别名

```typescript
resolve: {
  alias: [
    { find: /^~antd/, replacement: path.resolve(__dirname, 'node_modules/antd') },
    { find: /^~/, replacement: path.resolve(__dirname, 'node_modules') }
  ]
}
```

### pnpm 配置

```ini
strict-peer-dependencies=false
auto-install-peers=true
```

## 使用 pnpm 管理依赖

### 安装 pnpm

```bash
npm install -g pnpm
```

### 安装依赖

```bash
pnpm install
```

### 添加缺失的依赖

```bash
pnpm add @ant-design/icons@^4.8.0 @formily/shared
```

## 启动项目

```bash
pnpm run dev
```

## 验证结果

✅ 服务器启动成功
✅ 无 Less 编译错误
✅ 无依赖解析错误
✅ 页面正常加载
✅ 所有功能正常工作

## pnpm 优势

1. **节省磁盘空间**：使用硬链接和符号链接
2. **更快的安装速度**：并行安装和更好的缓存
3. **严格的依赖管理**：避免幽灵依赖
4. **更好的 monorepo 支持**：原生 workspace 支持

## 总结

改造的核心要点：
1. ✅ 保留所有原始代码逻辑
2. ✅ 仅修改构建配置
3. ✅ 修复 Less 别名问题
4. ✅ 支持 TypeScript
5. ✅ 使用 Vite 提升开发体验
6. ✅ 使用 pnpm 优化依赖管理

**改造完成！项目可以正常运行！** 🎉

## 代码优化记录

### 移除冗余文件

在完成 Vite 改造后，以下 Webpack 相关文件已被移除：

- ❌ `src/webpack.base.ts` - Webpack 基础配置（已用 vite.config.ts 替代）
- ❌ `src/webpack.dev.ts` - Webpack 开发环境配置
- ❌ `src/webpack.prod.ts` - Webpack 生产环境配置
- ❌ `src/template.ejs` - Webpack HTML 模板（已用 index.html 替代）

### 代码注释优化

为 `src/main.tsx` 添加了详细的中文注释说明：

1. **文件头部说明**：简要介绍 Demo 的用途和技术栈
2. **导入区域注释**：说明各个包的作用和核心组件功能
3. **配置注释**：NPM CDN 设置和多语言配置
4. **引擎创建注释**：设计器引擎实例化和快捷键配置
5. **UI 结构注释**：各个面板和组件的功能说明

### 优化后的项目结构

```
demo/
├── index.html              # HTML 入口
├── vite.config.ts         # Vite 配置
├── package.json           # 依赖配置
├── .npmrc                 # pnpm 配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Vite 配置文件的 TS 配置
└── src/
    ├── main.tsx           # 应用入口（已添加详细注释）
    ├── service/           # 服务层（Schema 保存等）
    └── widgets/           # 自定义 Widget 组件
```

### 验证结果

✅ 冗余文件已移除
✅ 代码注释已添加
✅ 开发服务器正常启动
✅ 无编译错误
✅ 所有功能正常工作
