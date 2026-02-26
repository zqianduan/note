# @designable/formily-transformer 包详解

## 一、包概述

`@designable/formily-transformer` 是 Designable 和 Formily 之间的桥梁，负责在 TreeNode（设计树）和 Formily Schema（JSON Schema）之间进行双向转换。

### 包信息

- **位置**：`/formily/transformer`
- **依赖**：
  - `@designable/core`（核心引擎）
  - `@designable/shared`（基础工具）
  - `@formily/json-schema`（Schema 处理）
- **输出格式**：CJS、ESM、UMD

### 核心功能

```
transformer/
└── src/
    └── index.ts    # 转换器实现
```

---

## 二、核心 API

### 2.1 transformToSchema

将 TreeNode 转换为 Formily Schema。

**函数签名**：

```typescript
export const transformToSchema = (
  node: ITreeNode,
  options?: ITransformerOptions
): IFormilySchema
```

**参数**：
- `node`：TreeNode 节点
- `options`：转换选项
  - `designableFieldName`：字段组件名称（默认 'Field'）
  - `designableFormName`：表单组件名称（默认 'Form'）

**返回值**：
```typescript
interface IFormilySchema {
  schema?: ISchema    // JSON Schema
  form?: Record<string, any>  // 表单配置
}
```

### 2.2 transformToTreeNode

将 Formily Schema 转换为 TreeNode。

**函数签名**：

```typescript
export const transformToTreeNode = (
  formily: IFormilySchema,
  options?: ITransformerOptions
): ITreeNode
```

**参数**：
- `formily`：Formily Schema 对象
- `options`：转换选项

**返回值**：TreeNode 节点对象

---

## 三、transformToSchema 实现原理

### 3.1 核心实现

```typescript
export const transformToSchema = (
  node: ITreeNode,
  options?: ITransformerOptions
): IFormilySchema => {
  const realOptions = createOptions(options)

  // 1. 查找 Form 根节点
  const root = findNode(node, (child) => {
    return child.componentName === realOptions.designableFormName
  })

  // 2. 初始化 Schema
  const schema = {
    type: 'object',
    properties: {},
  }

  if (!root) return { schema }

  // 3. 递归创建 Schema
  const createSchema = (node: ITreeNode, schema: ISchema = {}) => {
    // 复制节点属性到 Schema
    if (node !== root) {
      Object.assign(schema, clone(node.props))
    }

    // 保存设计器 ID
    schema['x-designable-id'] = node.id

    // 处理数组类型
    if (schema.type === 'array') {
      if (node.children[0]) {
        if (node.children[0].componentName === realOptions.designableFieldName) {
          schema.items = createSchema(node.children[0])
          schema['x-index'] = 0
        }
      }
      // 处理数组的其他子节点
      node.children.slice(1).forEach((child, index) => {
        if (child.componentName !== realOptions.designableFieldName) return
        const key = child.props.name || child.id
        schema.properties = schema.properties || {}
        schema.properties[key] = createSchema(child)
        schema.properties[key]['x-index'] = index
      })
    } else {
      // 处理对象类型
      node.children.forEach((child, index) => {
        if (child.componentName !== realOptions.designableFieldName) return
        const key = child.props.name || child.id
        schema.properties = schema.properties || {}
        schema.properties[key] = createSchema(child)
        schema.properties[key]['x-index'] = index
      })
    }

    return schema
  }

  return {
    form: clone(root.props),
    schema: createSchema(root, schema)
  }
}
```

### 3.2 转换流程

```
TreeNode
  ↓
1. 查找 Form 根节点
  ↓
2. 初始化 Schema 结构
  ↓
3. 递归遍历子节点
  ↓
4. 复制节点属性到 Schema
  ↓
5. 处理数组/对象类型
  ↓
6. 保存 x-designable-id
  ↓
Formily Schema
```

### 3.3 示例

**输入（TreeNode）**：

```javascript
{
  componentName: 'Form',
  props: {
    labelCol: 6,
    wrapperCol: 12,
  },
  children: [
    {
      componentName: 'Field',
      props: {
        name: 'username',
        type: 'string',
        title: '用户名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入用户名',
        },
      },
    },
    {
      componentName: 'Field',
      props: {
        name: 'password',
        type: 'string',
        title: '密码',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          type: 'password',
        },
      },
    },
  ],
}
```

**输出（Formily Schema）**：

```javascript
{
  form: {
    labelCol: 6,
    wrapperCol: 12,
  },
  schema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        title: '用户名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入用户名',
        },
        'x-designable-id': 'node_1',
        'x-index': 0,
      },
      password: {
        type: 'string',
        title: '密码',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          type: 'password',
        },
        'x-designable-id': 'node_2',
        'x-index': 1,
      },
    },
  },
}
```

---

## 四、transformToTreeNode 实现原理

### 4.1 核心实现

```typescript
export const transformToTreeNode = (
  formily: IFormilySchema = {},
  options?: ITransformerOptions
): ITreeNode => {
  const realOptions = createOptions(options)

  // 1. 创建根节点
  const root: ITreeNode = {
    componentName: realOptions.designableFormName,
    props: formily.form,
    children: [],
  }

  const schema = new Schema(formily.schema)

  // 2. 清理属性
  const cleanProps = (props: any) => {
    if (props['name'] === props['x-designable-id']) {
      delete props.name
    }
    delete props['version']
    delete props['_isJSONSchemaObject']
    return props
  }

  // 3. 递归添加树节点
  const appendTreeNode = (parent: ITreeNode, schema: Schema) => {
    if (!schema) return

    const current = {
      id: schema['x-designable-id'] || uid(),
      componentName: realOptions.designableFieldName,
      props: cleanProps(schema.toJSON(false)),
      children: [],
    }

    parent.children.push(current)

    // 处理数组的 items
    if (schema.items && !Array.isArray(schema.items)) {
      appendTreeNode(current, schema.items)
    }

    // 处理对象的 properties
    schema.mapProperties((schema) => {
      schema['x-designable-id'] = schema['x-designable-id'] || uid()
      appendTreeNode(current, schema)
    })
  }

  // 4. 遍历根 Schema 的 properties
  schema.mapProperties((schema) => {
    schema['x-designable-id'] = schema['x-designable-id'] || uid()
    appendTreeNode(root, schema)
  })

  return root
}
```

### 4.2 转换流程

```
Formily Schema
  ↓
1. 创建 Form 根节点
  ↓
2. 解析 Schema 对象
  ↓
3. 遍历 properties
  ↓
4. 递归创建 Field 节点
  ↓
5. 处理 items（数组）
  ↓
6. 生成/保留 x-designable-id
  ↓
TreeNode
```

### 4.3 示例

**输入（Formily Schema）**：

```javascript
{
  form: {
    labelCol: 6,
    wrapperCol: 12,
  },
  schema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        title: '用户名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-designable-id': 'node_1',
      },
      password: {
        type: 'string',
        title: '密码',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          type: 'password',
        },
        'x-designable-id': 'node_2',
      },
    },
  },
}
```

**输出（TreeNode）**：

```javascript
{
  componentName: 'Form',
  props: {
    labelCol: 6,
    wrapperCol: 12,
  },
  children: [
    {
      id: 'node_1',
      componentName: 'Field',
      props: {
        type: 'string',
        title: '用户名',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-designable-id': 'node_1',
      },
      children: [],
    },
    {
      id: 'node_2',
      componentName: 'Field',
      props: {
        type: 'string',
        title: '密码',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          type: 'password',
        },
        'x-designable-id': 'node_2',
      },
      children: [],
    },
  ],
}
```

---

## 五、双向转换的设计考量

### 5.1 ID 保持

使用 `x-designable-id` 字段保持节点的唯一标识：

```typescript
// TreeNode → Schema
schema['x-designable-id'] = node.id

// Schema → TreeNode
const current = {
  id: schema['x-designable-id'] || uid(),
  // ...
}
```

**作用**：
- 保证转换前后节点的对应关系
- 支持增量更新
- 便于调试和追踪

### 5.2 索引保持

使用 `x-index` 字段保持节点的顺序：

```typescript
schema.properties[key]['x-index'] = index
```

**作用**：
- 保证节点顺序不变
- 支持拖拽排序

### 5.3 属性清理

转换时清理不必要的属性：

```typescript
const cleanProps = (props: any) => {
  if (props['name'] === props['x-designable-id']) {
    delete props.name
  }
  delete props['version']
  delete props['_isJSONSchemaObject']
  return props
}
```

**作用**：
- 避免冗余数据
- 保持 Schema 的纯净性

### 5.4 深拷贝

使用深拷贝避免引用问题：

```typescript
Object.assign(schema, clone(node.props))
```

**作用**：
- 避免修改原始数据
- 防止意外的副作用

---

## 六、使用示例

### 6.1 导出 Schema

```typescript
import { transformToSchema } from '@designable/formily-transformer'

const handleExport = () => {
  const tree = engine.getCurrentTree()
  const { schema, form } = transformToSchema(tree)

  console.log('表单配置:', form)
  console.log('Schema:', schema)

  // 保存到后端
  saveToBackend({ schema, form })
}
```

### 6.2 导入 Schema

```typescript
import { transformToTreeNode } from '@designable/formily-transformer'

const handleImport = async () => {
  // 从后端加载
  const data = await loadFromBackend()

  // 转换为 TreeNode
  const tree = transformToTreeNode(data)

  // 设置到引擎
  engine.setCurrentTree(tree)
}
```

### 6.3 自定义组件名称

```typescript
const schema = transformToSchema(tree, {
  designableFieldName: 'MyField',
  designableFormName: 'MyForm',
})

const tree = transformToTreeNode(schema, {
  designableFieldName: 'MyField',
  designableFormName: 'MyForm',
})
```

### 6.4 完整示例

```typescript
import React from 'react'
import { useDesigner } from '@designable/react'
import { transformToSchema, transformToTreeNode } from '@designable/formily-transformer'

const SchemaManager = () => {
  const designer = useDesigner()

  // 导出
  const handleExport = () => {
    const tree = designer.getCurrentTree()
    const result = transformToSchema(tree)

    // 下载 JSON 文件
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.json'
    a.click()
  }

  // 导入
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result as string)
        const tree = transformToTreeNode(data)
        designer.setCurrentTree(tree)
      } catch (error) {
        console.error('导入失败:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <button onClick={handleExport}>导出 Schema</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  )
}
```

---

## 七、最佳实践

### 7.1 保持 ID 的唯一性

```typescript
// 确保每个节点都有唯一的 x-designable-id
schema['x-designable-id'] = schema['x-designable-id'] || uid()
```

### 7.2 验证 Schema

```typescript
import { Schema } from '@formily/json-schema'

const validateSchema = (schema: ISchema) => {
  try {
    new Schema(schema)
    return true
  } catch (error) {
    console.error('Schema 验证失败:', error)
    return false
  }
}
```

### 7.3 处理嵌套结构

```typescript
// 递归处理嵌套的对象和数组
const processNestedSchema = (schema: ISchema) => {
  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      processNestedSchema(schema.properties[key])
    })
  }
  if (schema.items && !Array.isArray(schema.items)) {
    processNestedSchema(schema.items)
  }
}
```

### 7.4 错误处理

```typescript
const safeTransform = (tree: ITreeNode) => {
  try {
    return transformToSchema(tree)
  } catch (error) {
    console.error('转换失败:', error)
    return { schema: { type: 'object', properties: {} }, form: {} }
  }
}
```

---

## 八、总结

### 核心价值

1. **双向转换**：TreeNode ↔ Formily Schema
2. **ID 保持**：通过 x-designable-id 保持节点对应关系
3. **索引保持**：通过 x-index 保持节点顺序
4. **深拷贝**：避免引用问题

### 转换流程

**TreeNode → Schema**：
```
TreeNode → 查找根节点 → 递归遍历 → 复制属性 → 生成 Schema
```

**Schema → TreeNode**：
```
Schema → 创建根节点 → 解析 properties → 递归创建节点 → 生成 TreeNode
```

### 学习要点

1. 理解双向转换的实现原理
2. 理解 x-designable-id 的作用
3. 理解递归遍历的逻辑
4. 掌握导入导出的使用方法

---

**下一步**：阅读 [@designable/react-settings-form 包详解](./06-react-settings-form包详解.md)，了解设置表单的实现。
