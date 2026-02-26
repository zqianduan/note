# Formily 完整示例集

这是一个基于 **@formily/core**、**@formily/react** 和 **Ant Design 4.15.0** 的完整 Formily 示例项目，涵盖了 Formily 的所有核心功能和最佳实践。

## 项目简介

本项目旨在帮助开发者全面了解和掌握 Formily 表单解决方案，通过 10 个精心设计的示例，从基础到高级，循序渐进地展示 Formily 的强大功能。

### 技术栈

- **React** 17.0.2
- **@formily/core** 2.2.27 - 核心表单模型
- **@formily/react** 2.2.27 - React 适配层
- **@formily/reactive** 2.2.27 - 响应式系统
- **@formily/json-schema** 2.2.27 - JSON Schema 支持
- **@formily/antd** 2.2.27 - Ant Design 组件适配
- **Ant Design** 4.15.0 - UI 组件库
- **react-virtualized** 9.22.5 - 虚拟滚动（大表单优化）
- **Vite** - 构建工具
- **TypeScript** - 类型支持

## 示例列表

### 01. 基础 Field 组件
- **文件**: [src/examples/01-BasicField.tsx](src/examples/01-BasicField.tsx)
- **功能**:
  - Field 组件的基本用法
  - FormProvider 提供表单上下文
  - FormConsumer 消费表单状态
  - 各种 Ant Design 组件的集成
  - 基础的表单验证

### 02. ArrayField 数组字段
- **文件**: [src/examples/02-ArrayField.tsx](src/examples/02-ArrayField.tsx)
- **功能**:
  - ArrayItems - 列表型数组组件
  - ArrayTable - 表格型数组组件
  - ArrayCollapse - 折叠面板型数组组件
  - 数组字段的增删改查操作
  - 嵌套数组结构处理

### 03. ObjectField 对象字段
- **文件**: [src/examples/03-ObjectField.tsx](src/examples/03-ObjectField.tsx)
- **功能**:
  - ObjectField 组织对象结构
  - 嵌套对象的处理
  - FormLayout 和 FormGrid 布局组件
  - 对象字段的路径访问

### 04. VoidField 虚拟字段
- **文件**: [src/examples/04-VoidField.tsx](src/examples/04-VoidField.tsx)
- **功能**:
  - VoidField 不参与数据提交
  - FormTab - 选项卡布局
  - FormCollapse - 折叠面板布局
  - FormStep - 分步表单
  - 纯 UI 组织功能

### 05. Formily Hooks
- **文件**: [src/examples/05-Hooks.tsx](src/examples/05-Hooks.tsx)
- **功能**:
  - useForm - 获取表单实例
  - useField - 获取字段实例
  - useFieldSchema - 获取字段 Schema
  - useFormEffects - 注册表单副作用
  - useParentForm - 获取父表单
  - useExpressionScope - 表达式作用域
  - observer - 响应式组件包装器

### 06. FormEffects 表单副作用
- **文件**: [src/examples/06-FormEffects.tsx](src/examples/06-FormEffects.tsx)
- **功能**:
  - 表单生命周期监听
  - 字段生命周期监听
  - 字段值变化监听
  - 复杂联动逻辑实现
  - 自定义 Effect Hook
  - 异步数据加载

### 07. 大表单性能测试（1000+ 字段）⭐
- **文件**: [src/examples/07-LargeForm.tsx](src/examples/07-LargeForm.tsx)
- **功能**:
  - 虚拟滚动优化（react-virtualized）
  - 按需渲染机制
  - 批量更新策略
  - 性能监控和统计
  - 支持 500-5000 个字段的表单
  - 大表单最佳实践

### 08. JSON Schema 动态表单⭐
- **文件**: [src/examples/08-JsonSchema.tsx](src/examples/08-JsonSchema.tsx)
- **功能**:
  - JSON Schema 定义表单结构
  - x-reactions 实现字段联动
  - x-component 和 x-decorator 配置
  - 动态表单渲染
  - 配置化表单开发
  - 用户注册表单示例
  - 商品管理表单示例（复杂联动）
  - 动态数组表单示例

### 09. Reactions 字段联动⭐
- **文件**: [src/examples/09-Reactions.tsx](src/examples/09-Reactions.tsx)
- **功能**:
  - 值联动 - 自动计算
  - 状态联动 - 显示/隐藏/启用/禁用
  - 省市区三级联动
  - 校验联动 - 动态校验规则
  - 样式联动 - 动态样式
  - 异步联动 - 异步数据加载

### 10. 综合示例 - 电商订单管理⭐
- **文件**: [src/examples/10-ComplexForm.tsx](src/examples/10-ComplexForm.tsx)
- **功能**:
  - 真实业务场景模拟
  - 所有组件类型的综合运用
  - 复杂的多级嵌套结构
  - 自动金额计算
  - 优惠券系统
  - 条件显示和动态校验
  - 完整的订单流程

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

项目会在 [http://localhost:3001](http://localhost:3001) 启动。

### 构建生产版本

```bash
npm run build
# 或
pnpm build
# 或
yarn build
```

### 预览生产版本

```bash
npm run preview
# 或
pnpm preview
# 或
yarn preview
```

## 项目结构

```
formily-demo/
├── src/
│   ├── examples/           # 示例代码目录
│   │   ├── 01-BasicField.tsx
│   │   ├── 02-ArrayField.tsx
│   │   ├── 03-ObjectField.tsx
│   │   ├── 04-VoidField.tsx
│   │   ├── 05-Hooks.tsx
│   │   ├── 06-FormEffects.tsx
│   │   ├── 07-LargeForm.tsx
│   │   ├── 08-JsonSchema.tsx
│   │   ├── 09-Reactions.tsx
│   │   └── 10-ComplexForm.tsx
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目文档
```

## 核心概念

### 1. 响应式系统

Formily 基于 `@formily/reactive` 构建了一套完整的响应式系统，实现了：
- 字段状态的自动追踪和更新
- 精确的依赖收集和触发
- 高性能的批量更新机制

### 2. 字段模型

Formily 提供了四种核心字段组件：
- **Field**: 普通字段，对应表单中的一个输入项
- **ArrayField**: 数组字段，管理数组类型的数据
- **ObjectField**: 对象字段，组织对象结构的数据
- **VoidField**: 虚拟字段，不参与数据提交，用于 UI 组织

### 3. JSON Schema

支持通过 JSON Schema 配置化定义表单：
- 降低维护成本
- 便于动态生成表单
- 支持服务端驱动
- 可视化表单设计

### 4. 字段联动（Reactions）

Formily 最强大的特性之一：
- 值联动：字段间的数据计算
- 状态联动：控制字段的显示、禁用等状态
- 异步联动：根据字段值异步加载数据
- 校验联动：动态调整校验规则

### 5. 性能优化

- **精确渲染**: 只重渲染发生变化的字段
- **虚拟滚动**: 处理大量字段时使用虚拟列表
- **批量更新**: 使用 batch 合并多次更新
- **按需加载**: 字段在可见时才初始化

## 使用技巧

### 1. 选择合适的字段组件

- 简单值使用 `Field`
- 数组数据使用 `ArrayField`
- 对象数据使用 `ObjectField`
- 纯布局使用 `VoidField`

### 2. 合理使用 Reactions

```typescript
// 函数式 Reactions
<Field
  name="total"
  reactions={(field) => {
    const price = field.query('price').value()
    const quantity = field.query('quantity').value()
    field.value = price * quantity
  }}
/>

// JSON Schema Reactions
{
  "x-reactions": {
    "dependencies": [".price", ".quantity"],
    "fulfill": {
      "state": {
        "value": "{{$deps[0] * $deps[1]}}"
      }
    }
  }
}
```

### 3. 优化大表单性能

- 使用虚拟滚动（参考示例 07）
- 避免在 reactions 中使用 `*` 通配符
- 使用 `setValues` 批量更新而非多次 `setValue`
- 合理使用 `observer` 包装组件

### 4. 表单校验

```typescript
// 同步校验
validator={[
  {
    required: true,
    message: '不能为空'
  },
  {
    pattern: /^1[3-9]\d{9}$/,
    message: '手机号格式不正确'
  }
]}

// 异步校验
validator={[
  async (value) => {
    const res = await checkUsername(value)
    return res.exists ? '用户名已存在' : ''
  }
]}
```

## 常见问题

### Q: 如何实现字段联动？

A: 有三种方式：
1. 使用 Field 的 `reactions` 属性
2. 使用 JSON Schema 的 `x-reactions` 配置
3. 使用 `createForm` 的 `effects` 配置

参考示例 06 和示例 09。

### Q: 如何处理大表单性能问题？

A:
1. 使用虚拟滚动（参考示例 07）
2. 使用 Tab 或 Step 分步加载
3. 避免不必要的全量监听
4. 使用批量更新 API

### Q: 如何实现动态表单？

A: 使用 JSON Schema 方式（参考示例 08），表单结构由数据驱动，可以从服务端获取 Schema 配置。

### Q: Field、ObjectField、VoidField 的区别？

A:
- **Field**: 产生数据节点，对应表单值中的一个字段
- **ObjectField**: 产生对象节点，内部字段组织成对象结构
- **VoidField**: 不产生数据节点，仅用于 UI 组织

### Q: 如何自定义组件？

A:
```typescript
const CustomInput = observer((props) => {
  const field = useField() // 获取字段实例
  return (
    <input
      value={field.value}
      onChange={(e) => field.setValue(e.target.value)}
    />
  )
})

// 使用
<Field name="custom" component={[CustomInput]} />
```

## 学习路径

### 初级（入门）
1. 示例 01 - 基础 Field 组件
2. 示例 02 - ArrayField 数组字段
3. 示例 03 - ObjectField 对象字段
4. 示例 04 - VoidField 虚拟字段

### 中级（进阶）
5. 示例 05 - Formily Hooks
6. 示例 06 - FormEffects 表单副作用
7. 示例 09 - Reactions 字段联动

### 高级（实战）
8. 示例 07 - 大表单性能测试
9. 示例 08 - JSON Schema 动态表单
10. 示例 10 - 综合示例（电商订单）

## 参考资源

- [Formily 官方文档](https://formilyjs.org/)
- [Formily GitHub](https://github.com/alibaba/formily)
- [Ant Design 官方文档](https://ant.design/)
- [React 官方文档](https://react.dev/)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 联系方式

如有问题，请通过 GitHub Issues 联系。

---

**注意**: 本项目仅供学习和参考使用，生产环境请根据实际需求调整。
