# @designable/react 包详解

## 一、包概述

`@designable/react` 是 Designable 的 React 集成层，提供了完整的 UI 组件和 Hooks 系统，将核心引擎与 React 应用无缝集成。

### 包信息

- **位置**：`/packages/react`
- **依赖**：
  - `@designable/core`（核心引擎）
  - `@designable/shared`（基础工具）
  - `@formily/reactive-react`（响应式 React）
  - `antd`（UI 组件库）
- **输出格式**：CJS、ESM、UMD

### 核心模块

```
react/
├── containers/      # 容器组件（10个）
├── hooks/           # React Hooks（28个）
├── widgets/         # UI 小部件（18个）
├── panels/          # 面板组件（7个）
├── simulators/      # 模拟器（6个）
├── icons/           # 图标资源（56个）
├── locales/         # 国际化（7个语言）
└── context.ts       # React Context
```

## 二、Context 系统

### 2.1 DesignerEngineContext

提供设计器引擎实例的 Context。

```typescript
import { createContext } from 'react'
import { Engine } from '@designable/core'

export const DesignerEngineContext = createContext<Engine>(null)
```

### 2.2 DesignerLayoutContext

提供布局信息的 Context。

```typescript
export interface IDesignerLayoutContext {
  theme?: 'dark' | 'light' | (string & {})
  prefixCls?: string
  position?: 'fixed' | 'absolute' | 'relative'
}

export const DesignerLayoutContext = createContext<IDesignerLayoutContext>(null)
```

---

## 三、Hooks 系统

### 3.1 useDesigner

获取设计器引擎实例。

```typescript
import { useContext, useEffect } from 'react'
import { Engine } from '@designable/core'
import { DesignerEngineContext } from '../context'

export const useDesigner = (effects?: (engine: Engine) => void): Engine => {
  const designer = useContext(DesignerEngineContext)

  useEffect(() => {
    if (effects) {
      return effects(designer)
    }
  }, [])

  return designer
}
```

**使用示例**：

```typescript
const MyComponent = () => {
  const designer = useDesigner()

  const handleSave = () => {
    const tree = designer.getCurrentTree()
    console.log('保存', tree)
  }

  return <button onClick={handleSave}>保存</button>
}
```

### 3.2 useWorkspace

获取当前工作区。

```typescript
import { useDesigner } from './useDesigner'
import { Workspace } from '@designable/core'

export const useWorkspace = (): Workspace => {
  const designer = useDesigner()
  return designer.workbench.currentWorkspace
}
```

### 3.3 useSelection

获取选择状态。

```typescript
import { useWorkspace } from './useWorkspace'
import { observer } from '@formily/reactive-react'

export const useSelection = () => {
  const workspace = useWorkspace()
  return workspace?.operation?.selection
}

// 使用 observer 包裹组件以响应选择变化
export const MyComponent = observer(() => {
  const selection = useSelection()
  const selectedNodes = selection?.selectedNodes || []

  return <div>选中了 {selectedNodes.length} 个节点</div>
})
```

### 3.4 useTree

获取设计树。

```typescript
export const useTree = () => {
  const workspace = useWorkspace()
  return workspace?.operation?.tree
}
```

### 3.5 useViewport

获取视口。

```typescript
export const useViewport = () => {
  const workspace = useWorkspace()
  return workspace?.viewport
}
```

### 3.6 useHistory

获取历史记录。

```typescript
export const useHistory = () => {
  const workspace = useWorkspace()
  return workspace?.history
}
```

### 3.7 useCursor

获取光标状态。

```typescript
export const useCursor = () => {
  const designer = useDesigner()
  return designer?.cursor
}
```

### 3.8 useHover

获取悬停状态。

```typescript
export const useHover = () => {
  const workspace = useWorkspace()
  return workspace?.operation?.hover
}
```

### 3.9 其他 Hooks

- `useScreen()`：获取屏幕状态
- `useKeyboard()`：获取键盘状态
- `useOperation()`：获取操作对象
- `useSelectedNode()`：获取选中的节点
- `useCurrentNode()`：获取当前节点
- `useNodeIdProps()`：获取节点 ID 属性
- `useTreeNode()`：获取树节点
- `useComponents()`：获取组件列表
- `useRegistry()`：获取注册表
- `usePrefix()`：获取 CSS 前缀
- `useTheme()`：获取主题
- `usePosition()`：获取位置
- `useLayout()`：获取布局信息

---

## 四、容器组件

### 4.1 Designer

顶层容器，提供设计器引擎的 Context。

```typescript
export interface IDesignerProps {
  engine: Engine
  theme?: 'dark' | 'light'
  prefixCls?: string
  position?: 'fixed' | 'absolute' | 'relative'
}

export const Designer: React.FC<IDesignerProps> = (props) => {
  const { engine, theme, prefixCls, position, children } = props

  useEffect(() => {
    engine.mount()
    return () => {
      engine.unmount()
    }
  }, [engine])

  return (
    <DesignerEngineContext.Provider value={engine}>
      <DesignerLayoutContext.Provider value={{ theme, prefixCls, position }}>
        {children}
      </DesignerLayoutContext.Provider>
    </DesignerEngineContext.Provider>
  )
}
```

**使用示例**：

```typescript
import { Designer } from '@designable/react'
import { createDesigner } from '@designable/core'

const engine = createDesigner()

const App = () => {
  return (
    <Designer engine={engine}>
      {/* 设计器内容 */}
    </Designer>
  )
}
```

### 4.2 Workspace

工作区容器。

```typescript
export interface IWorkspaceProps {
  id?: string
  title?: string
  description?: string
}

export const Workspace: React.FC<IWorkspaceProps> = (props) => {
  const designer = useDesigner()
  const workspace = useMemo(() => {
    return designer.workbench.ensureWorkspace(props.id)
  }, [props.id])

  useEffect(() => {
    designer.workbench.setActiveWorkspace(workspace)
  }, [workspace])

  return (
    <WorkspaceContext.Provider value={workspace}>
      {props.children}
    </WorkspaceContext.Provider>
  )
}
```

### 4.3 Viewport

视口容器。

```typescript
export interface IViewportProps {
  placeholder?: React.ReactNode
  dragTipsDirection?: 'left' | 'right'
}

export const Viewport: React.FC<IViewportProps> = observer((props) => {
  const viewport = useViewport()
  const ref = useRef<HTMLDivElement>()

  useEffect(() => {
    if (ref.current) {
      viewport.attachEvents(ref.current)
    }
    return () => {
      viewport.detachEvents()
    }
  }, [])

  return (
    <div ref={ref} className="dn-viewport">
      {props.children}
    </div>
  )
})
```

### 4.4 其他容器

- **Simulator**：模拟器容器（支持响应式预览）
- **Layout**：布局容器
- **StudioPanel**：工作室面板
- **CompositePanel**：复合面板
- **SettingsPanel**：设置面板

---

## 五、Widget 组件

### 5.1 AuxToolWidget

辅助工具小部件，显示选择框、拖拽提示等。

```typescript
export const AuxToolWidget: React.FC = observer(() => {
  const selection = useSelection()
  const cursor = useCursor()

  return (
    <div className="dn-aux-tool">
      {/* 选择框 */}
      {selection?.selectedNodes.map(node => (
        <SelectionBox key={node.id} node={node} />
      ))}

      {/* 拖拽提示 */}
      {cursor?.type === 'DRAG_MOVE' && (
        <DragGhost />
      )}
    </div>
  )
})
```

### 5.2 ComponentTreeWidget

组件树小部件。

```typescript
export const ComponentTreeWidget: React.FC = observer(() => {
  const tree = useTree()

  const renderNode = (node: TreeNode) => {
    return (
      <TreeNode key={node.id} node={node}>
        {node.children?.map(renderNode)}
      </TreeNode>
    )
  }

  return (
    <div className="dn-component-tree">
      {renderNode(tree)}
    </div>
  )
})
```

### 5.3 OutlineTreeWidget

大纲树小部件。

```typescript
export const OutlineTreeWidget: React.FC = observer(() => {
  const tree = useTree()
  const selection = useSelection()

  const handleSelect = (node: TreeNode) => {
    selection.select(node)
  }

  return (
    <Tree
      treeData={transformToTreeData(tree)}
      selectedKeys={selection.selected}
      onSelect={handleSelect}
    />
  )
})
```

### 5.4 ResourceWidget

资源组件小部件，用于展示可拖拽的组件库。

```typescript
export interface IResourceWidgetProps {
  title?: React.ReactNode
  sources?: IResourceItem[]
}

export const ResourceWidget: React.FC<IResourceWidgetProps> = (props) => {
  const { title, sources } = props

  return (
    <div className="dn-resource-widget">
      <div className="dn-resource-widget-title">{title}</div>
      <div className="dn-resource-widget-content">
        {sources?.map((source, index) => (
          <ResourceItem key={index} source={source} />
        ))}
      </div>
    </div>
  )
}
```

### 5.5 HistoryWidget

历史记录小部件。

```typescript
export const HistoryWidget: React.FC = observer(() => {
  const history = useHistory()

  return (
    <div className="dn-history-widget">
      <button
        disabled={!history.allowUndo}
        onClick={() => history.undo()}
      >
        撤销
      </button>
      <button
        disabled={!history.allowRedo}
        onClick={() => history.redo()}
      >
        重做
      </button>
    </div>
  )
})
```

### 5.6 其他 Widget

- **GhostWidget**：幽灵节点（拖拽时的预览）
- **IconWidget**：图标组件
- **NodeActionsWidget**：节点操作按钮
- **NodePathWidget**：节点路径
- **ViewToolsWidget**：视图工具（切换视图）
- **DesignerToolsWidget**：设计器工具
- **EmptyWidget**：空状态
- **DroppableWidget**：可拖放区域

---

## 六、Panel 组件

### 6.1 CompositePanel

复合面板，用于左侧的组件库和大纲树。

```typescript
export const CompositePanel: React.FC & {
  Item: React.FC<ICompositePanelItemProps>
} = (props) => {
  const [activeKey, setActiveKey] = useState<string>()

  return (
    <div className="dn-composite-panel">
      <div className="dn-composite-panel-tabs">
        {/* 标签页 */}
      </div>
      <div className="dn-composite-panel-content">
        {/* 内容区域 */}
      </div>
    </div>
  )
}

CompositePanel.Item = (props) => {
  return <div className="dn-composite-panel-item">{props.children}</div>
}
```

**使用示例**：

```typescript
<CompositePanel>
  <CompositePanel.Item title="组件库" icon="Component">
    <ResourceWidget sources={components} />
  </CompositePanel.Item>
  <CompositePanel.Item title="大纲树" icon="Outline">
    <OutlineTreeWidget />
  </CompositePanel.Item>
</CompositePanel>
```

### 6.2 SettingsPanel

设置面板，用于右侧的属性配置。

```typescript
export interface ISettingsPanelProps {
  title?: React.ReactNode
  extra?: React.ReactNode
}

export const SettingsPanel: React.FC<ISettingsPanelProps> = (props) => {
  return (
    <div className="dn-settings-panel">
      <div className="dn-settings-panel-header">
        <div className="dn-settings-panel-title">{props.title}</div>
        <div className="dn-settings-panel-extra">{props.extra}</div>
      </div>
      <div className="dn-settings-panel-body">
        {props.children}
      </div>
    </div>
  )
}
```

### 6.3 StudioPanel

工作室面板，提供完整的设计器布局框架。

```typescript
export interface IStudioPanelProps {
  logo?: React.ReactNode
  actions?: React.ReactNode
}

export const StudioPanel: React.FC<IStudioPanelProps> = (props) => {
  const prefix = usePrefix('main-panel')

  return (
    <div className={prefix}>
      <div className={prefix + '-header'}>
        <div className={prefix + '-header-logo'}>{props.logo}</div>
        <div className={prefix + '-header-actions'}>{props.actions}</div>
      </div>
      <div className={prefix + '-body'}>
        {props.children}
      </div>
    </div>
  )
}
```

### 6.4 其他 Panel

- **ToolbarPanel**：工具栏面板
- **ViewPanel**：视图面板（支持多种视图模式）
- **ViewportPanel**：视口面板
- **WorkspacePanel**：工作区面板

---

## 七、完整示例

### 7.1 基础设计器

```tsx
import React from 'react'
import {
  Designer,
  DesignerToolsWidget,
  ViewPanel,
  CompositePanel,
  Workspace,
  OutlineTreeWidget,
  ResourceWidget,
  StudioPanel,
  SettingsPanel,
  ViewportPanel,
  ToolbarPanel,
  ViewToolsWidget,
} from '@designable/react'
import { SettingsForm } from '@designable/react-settings-form'
import { createDesigner } from '@designable/core'

const engine = createDesigner({
  shortcuts: [],
  rootComponentName: 'Form',
})

const App = () => {
  return (
    <Designer engine={engine}>
      <StudioPanel logo={<div>表单设计器</div>}>
        {/* 左侧：组件库和大纲树 */}
        <CompositePanel>
          <CompositePanel.Item title="组件库" icon="Component">
            <ResourceWidget
              title="输入控件"
              sources={[
                {
                  componentName: 'Field',
                  props: {
                    type: 'string',
                    title: '输入框',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                  },
                },
              ]}
            />
          </CompositePanel.Item>
          <CompositePanel.Item title="大纲树" icon="Outline">
            <OutlineTreeWidget />
          </CompositePanel.Item>
        </CompositePanel>

        {/* 中间：工作区 */}
        <Workspace id="form">
          <WorkspacePanel>
            <ToolbarPanel>
              <DesignerToolsWidget />
              <ViewToolsWidget use={['DESIGNABLE', 'JSONTREE', 'PREVIEW']} />
            </ToolbarPanel>
            <ViewportPanel>
              <ViewPanel type="DESIGNABLE">
                {() => (
                  <div style={{ padding: '20px' }}>
                    {/* 设计区域 */}
                  </div>
                )}
              </ViewPanel>
              <ViewPanel type="JSONTREE">
                {(tree) => (
                  <pre>{JSON.stringify(tree, null, 2)}</pre>
                )}
              </ViewPanel>
            </ViewportPanel>
          </WorkspacePanel>
        </Workspace>

        {/* 右侧：属性配置 */}
        <SettingsPanel title="属性配置">
          <SettingsForm />
        </SettingsPanel>
      </StudioPanel>
    </Designer>
  )
}

export default App
```

### 7.2 自定义工具

```tsx
import { useDesigner } from '@designable/react'
import { observer } from '@formily/reactive-react'

const CustomTool = observer(() => {
  const designer = useDesigner()
  const tree = designer.getCurrentTree()

  const handleExport = () => {
    const json = tree.serialize()
    console.log('导出', json)
  }

  return (
    <button onClick={handleExport}>
      导出 JSON
    </button>
  )
})
```

### 7.3 监听事件

```ts
import { useDesigner } from '@designable/react'
import { useEffect } from 'react'

const EventMonitor = () => {
  const designer = useDesigner((engine) => {
    // 监听选择变化
    const unsubscribe = engine.subscribeTo('selection:change', (event) => {
      console.log('选中的节点:', event.data)
    })

    return unsubscribe
  })

  return null
}
```

---

## 八、总结

### 核心价值

1. **完整的 React 集成**：提供 Context、Hooks、组件
2. **响应式 UI**：基于 @formily/reactive-react
3. **丰富的组件库**：50+ 个组件和 Widget
4. **灵活的布局**：支持自定义布局和主题

### 组件分类

- **容器组件**：Designer、Workspace、Viewport 等
- **Widget 组件**：AuxTool、ComponentTree、Outline 等
- **Panel 组件**：CompositePanel、SettingsPanel 等

### 学习要点

1. 理解 Context 和 Hooks 的使用
2. 理解 observer 的作用（响应式更新）
3. 理解组件的组合方式
4. 掌握自定义组件的开发

---

**下一步**：阅读 [@designable/formily-transformer 包详解](./05-formily-transformer包详解.md)，了解数据转换机制。
