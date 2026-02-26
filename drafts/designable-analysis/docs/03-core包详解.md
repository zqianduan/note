# @designable/core 包详解

## 一、包概述

`@designable/core` 是 Designable 的核心引擎包，提供了设计器的核心逻辑和数据模型。它是整个框架的大脑，负责管理设计树、处理用户交互、维护历史记录等核心功能。

### 包信息

- **位置**：`/packages/core`
- **依赖**：
  - `@designable/shared`（基础工具库）
  - `@formily/reactive`（响应式系统）
  - `@formily/json-schema`（Schema 处理）
  - `@juggle/resize-observer`（尺寸监听）
- **输出格式**：CJS、ESM、UMD

### 核心模块

```
core/
├── models/          # 核心数据模型（18个）
├── drivers/         # 事件驱动器（7个）
├── effects/         # 副作用处理器（12个）
├── events/          # 事件定义
├── registry.ts      # 全局注册表
└── externals.ts     # 外部接口
```

## 二、核心模型详解

### 2.1 Engine（引擎）

Engine 是整个设计器的核心控制器，负责生命周期管理和全局状态。

**核心代码**：

```typescript
export class Engine extends Event {
  id: string
  props: IEngineProps<Engine>
  cursor: Cursor          // 光标状态
  workbench: Workbench    // 工作台
  keyboard: Keyboard      // 键盘状态
  screen: Screen          // 屏幕状态

  constructor(props: IEngineProps<Engine>) {
    super(props)
    this.props = { ...Engine.defaultProps, ...props }
    this.init()
    this.id = uid()
  }

  init() {
    this.workbench = new Workbench(this)
    this.screen = new Screen(this)
    this.cursor = new Cursor(this)
    this.keyboard = new Keyboard(this)
  }

  mount() {
    this.attachEvents(globalThisPolyfill)
  }

  unmount() {
    this.detachEvents()
  }

  // 设置当前设计树
  setCurrentTree(tree?: ITreeNode) {
    if (this.workbench.currentWorkspace) {
      this.workbench.currentWorkspace.operation.tree.from(tree)
    }
  }

  // 获取当前设计树
  getCurrentTree() {
    return this.workbench?.currentWorkspace?.operation?.tree
  }
}
```

**关键职责**：
- 管理工作台（Workbench）
- 管理全局状态（Cursor、Keyboard、Screen）
- 提供生命周期方法（mount/unmount）
- 提供便捷的 API（setCurrentTree、getCurrentTree）

---

### 2.2 TreeNode（树节点）

TreeNode 是设计树的基本单元，采用组合模式实现。

**核心属性**：

```typescript
export class TreeNode {
  id: string                      // 唯一标识
  componentName: string           // 组件名称
  props: Record<string, any>      // 组件属性
  children: TreeNode[]            // 子节点
  parent: TreeNode                // 父节点
  root: TreeNode                  // 根节点
  depth: number                   // 深度
  hidden: boolean                 // 是否隐藏

  // 设计器配置（通过 GlobalRegistry 获取）
  get designerProps(): IDesignerProps
  get designerLocales(): IDesignerLocales
}
```

**树操作方法**：

```typescript
// 添加子节点
append(...nodes: TreeNode[]): TreeNode[]
prepend(...nodes: TreeNode[]): TreeNode[]

// 插入节点
insertAfter(...nodes: TreeNode[]): TreeNode[]
insertBefore(...nodes: TreeNode[]): TreeNode[]

// 删除节点
remove(): TreeNode

// 包裹节点
wrap(wrapper: TreeNode): TreeNode

// 遍历
eachChildren(callback: (node: TreeNode) => void | boolean)
eachTree(callback: (node: TreeNode) => void | boolean)

// 查找
find(finder: INodeFinder): TreeNode
findAll(finder: INodeFinder): TreeNode[]
```

**响应式实现**：

```typescript
makeObservable() {
  define(this, {
    componentName: observable.ref,
    props: observable,
    hidden: observable.ref,
    children: observable.shallow,
    designerProps: observable.computed,
    designerLocales: observable.computed,
    append: action,
    prepend: action,
    remove: action,
    // ...
  })
}
```

**设计亮点**：
- 使用 `observable.shallow` 优化数组性能
- 使用 `observable.computed` 缓存计算属性
- 自动维护 parent、root、depth 关系
- 全局缓存机制（通过 Map 快速查找）

---

### 2.3 Workspace（工作区）

Workspace 管理单个设计器实例。

```typescript
export class Workspace {
  id: string
  engine: Engine
  viewport: Viewport      // 主视口（画布）
  outline: Viewport       // 大纲视口（树形结构）
  operation: Operation    // 操作对象
  history: History        // 历史记录

  constructor(engine: Engine) {
    this.engine = engine
    this.viewport = new Viewport({
      engine,
      workspace: this,
      viewportType: 'viewport',
    })
    this.outline = new Viewport({
      engine,
      workspace: this,
      viewportType: 'outline',
    })
    this.operation = new Operation(this)
    this.history = new History(this, {
      onPush: (item) => {
        this.operation.snapshot(item.type)
      },
    })
  }
}
```

**关键概念**：
- **viewport**：主视口，用户操作的画布区域
- **outline**：大纲视口，显示树形结构
- **operation**：操作对象，包含 tree、selection、hover 等
- **history**：历史记录，支持撤销/重做

---

### 2.4 Operation（操作）

Operation 是工作区的核心操作对象。

```typescript
export class Operation {
  workspace: Workspace
  tree: TreeNode              // 设计树
  selection: Selection        // 选择管理
  hover: Hover                // 悬停管理
  transformHelper: TransformHelper  // 变换辅助
  moveHelper: MoveHelper      // 移动辅助

  constructor(workspace: Workspace) {
    this.workspace = workspace
    this.tree = new TreeNode({
      componentName: workspace.engine.props.rootComponentName,
      ...workspace.engine.props.defaultComponentTree,
      operation: this,
    })
    this.selection = new Selection(this)
    this.hover = new Hover(this)
    this.transformHelper = new TransformHelper(this)
    this.moveHelper = new MoveHelper(this)
  }

  // 保存快照
  snapshot(type?: string) {
    this.workspace.history.push(type)
  }
}
```

---

### 2.5 Selection（选择管理）

Selection 管理选中的节点。

```typescript
export class Selection {
  operation: Operation
  selected: string[] = []  // 选中的节点 ID

  // 选择单个节点
  select(node: TreeNode) {
    if (node === this.first) return
    this.selected = [node.id]
  }

  // 批量选择
  batchSelect(nodes: TreeNode[]) {
    this.selected = nodes.map(node => node.id)
  }

  // 添加到选择
  add(node: TreeNode) {
    if (!this.selected.includes(node.id)) {
      this.selected.push(node.id)
    }
  }

  // 从选择中移除
  remove(node: TreeNode) {
    this.selected = this.selected.filter(id => id !== node.id)
  }

  // 清空选择
  clear() {
    this.selected = []
  }

  // 获取选中的节点
  get selectedNodes(): TreeNode[] {
    return this.selected.map(id => TreeNode.findById(id)).filter(Boolean)
  }

  get first(): TreeNode {
    return this.selectedNodes[0]
  }

  get last(): TreeNode {
    return this.selectedNodes[this.selectedNodes.length - 1]
  }
}
```

---

### 2.6 History（历史记录）

History 实现撤销/重做功能。

```typescript
export class History<T = any> {
  workspace: Workspace
  list: IHistoryItem<T>[] = []
  current = 0

  // 保存快照
  push(type?: string) {
    if (this.locking) return
    const item = this.serialize(type)
    this.list = this.list.slice(0, this.current + 1)
    this.list.push(item)
    this.current++
  }

  // 撤销
  undo() {
    if (this.allowUndo) {
      this.current--
      this.goTo(this.current)
    }
  }

  // 重做
  redo() {
    if (this.allowRedo) {
      this.current++
      this.goTo(this.current)
    }
  }

  // 跳转到指定历史
  goTo(index: number) {
    const item = this.list[index]
    if (item) {
      this.locking = true
      this.deserialize(item)
      this.locking = false
    }
  }

  get allowUndo() {
    return this.current > 0
  }

  get allowRedo() {
    return this.current < this.list.length - 1
  }
}
```

**设计亮点**：
- 快照式存储，每次操作保存完整状态
- 使用 `locking` 标志避免循环触发
- 使用 `requestIdleCallback` 优化性能

---

### 2.7 Viewport（视口）

Viewport 管理画布区域。

```typescript
export class Viewport {
  engine: Engine
  workspace: Workspace
  viewportElement: HTMLElement
  contentWindow: Window
  dragStartSnapshot: IViewportData

  // 获取元素
  getElement(id: string): HTMLElement {
    return this.contentWindow?.document?.querySelector(
      `[${this.engine.props.nodeIdAttrName}="${id}"]`
    )
  }

  // 获取元素矩形
  getElementRect(element: HTMLElement): DOMRect {
    return element?.getBoundingClientRect()
  }

  // 坐标转换
  getOffsetPoint(event: MouseEvent): IPoint {
    const rect = this.viewportElement.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }
}
```

---

## 三、Driver 系统

Driver 负责监听原生事件并转换为自定义事件。

### 3.1 DragDropDriver（拖拽驱动）

```typescript
export class DragDropDriver extends EventDriver<Engine> {
  onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    GlobalState.startEvent = e
    GlobalState.dragging = false
    this.batchAddEventListener('mouseup', this.onMouseUp)
    this.batchAddEventListener('mousemove', this.onDistanceChange)
  }

  onStartDrag = (e: MouseEvent) => {
    if (GlobalState.dragging) return
    this.dispatch(new DragStartEvent({
      clientX: e.clientX,
      clientY: e.clientY,
      // ...
    }))
    GlobalState.dragging = true
  }

  onMouseMove = (e: MouseEvent) => {
    this.dispatch(new DragMoveEvent({
      clientX: e.clientX,
      clientY: e.clientY,
      // ...
    }))
  }

  onMouseUp = (e: MouseEvent) => {
    if (GlobalState.dragging) {
      this.dispatch(new DragStopEvent({
        clientX: e.clientX,
        clientY: e.clientY,
        // ...
      }))
    }
    GlobalState.dragging = false
  }
}
```

### 3.2 其他 Driver

- **KeyboardDriver**：键盘事件驱动
- **MouseClickDriver**：鼠标点击驱动
- **MouseMoveDriver**：鼠标移动驱动
- **ViewportResizeDriver**：视口调整驱动
- **ViewportScrollDriver**：视口滚动驱动

---

## 四、Effect 系统

Effect 处理自定义事件并更新模型状态。

### 4.1 useDragDropEffect（拖拽效果）

```typescript
export const useDragDropEffect = (engine: Engine) => {
  engine.subscribeTo(DragStartEvent, (event) => {
    // 处理拖拽开始
    const target = event.data.target
    const node = TreeNode.findById(target.getAttribute('data-designer-node-id'))
    if (node) {
      engine.workbench.currentWorkspace.operation.moveHelper.dragStart(node)
    }
  })

  engine.subscribeTo(DragMoveEvent, (event) => {
    // 处理拖拽移动
    engine.workbench.currentWorkspace.operation.moveHelper.dragMove(event)
  })

  engine.subscribeTo(DragStopEvent, (event) => {
    // 处理拖拽结束
    engine.workbench.currentWorkspace.operation.moveHelper.dragEnd()
  })
}
```

### 4.2 其他 Effect

- **useSelectionEffect**：选择效果
- **useResizeEffect**：调整大小效果
- **useTranslateEffect**：平移效果
- **useContentEditableEffect**：内容编辑效果
- **useAutoScrollEffect**：自动滚动效果
- **useCursorEffect**：光标效果
- **useKeyboardEffect**：键盘效果

---

## 五、GlobalRegistry（全局注册表）

GlobalRegistry 提供全局的注册和查询能力。

```typescript
const DESIGNER_BEHAVIORS_STORE: IDesignerBehaviorStore = observable.ref([])
const DESIGNER_ICONS_STORE: IDesignerIconsStore = observable.ref({})
const DESIGNER_LOCALES_STORE: IDesignerLocaleStore = observable.ref({})
const DESIGNER_LANGUAGE_STORE: IDesignerLanguageStore = observable.ref('zh-CN')

export const GlobalRegistry = {
  // 注册设计器行为
  registerDesignerBehaviors: (...packages: IDesignerBehaviors[]) => {
    packages.forEach((pkg) => {
      const behaviors = []
      for (const key in pkg) {
        if (Array.isArray(pkg[key])) {
          behaviors.push(...pkg[key])
        }
      }
      DESIGNER_BEHAVIORS_STORE.value = DESIGNER_BEHAVIORS_STORE.value.concat(behaviors)
    })
  },

  // 获取节点的行为配置
  getDesignerBehaviors: (node: TreeNode) => {
    return DESIGNER_BEHAVIORS_STORE.value.filter((pattern) =>
      pattern.selector(node)
    )
  },

  // 注册图标
  registerDesignerIcons: (map: IDesignerIcons) => {
    Object.assign(DESIGNER_ICONS_STORE.value, map)
  },

  // 注册国际化
  registerDesignerLocales: (...packages: IDesignerLocales[]) => {
    packages.forEach((pkg) => {
      mergeLocales(DESIGNER_LOCALES_STORE.value, pkg)
    })
  },

  // 设置语言
  setDesignerLanguage: (lang: string) => {
    DESIGNER_LANGUAGE_STORE.value = lang
  },
}
```

**使用示例**：

```typescript
// 注册组件行为
GlobalRegistry.registerDesignerBehaviors({
  Input: {
    Behavior: [{
      name: 'Input',
      selector: (node) => node.componentName === 'Input',
      designerProps: {
        droppable: false,
        resizable: false,
      },
      designerLocales: {
        'zh-CN': {
          title: '输入框',
          settings: {
            'x-component-props.placeholder': '占位符',
          }
        }
      }
    }]
  }
})

// 注册图标
GlobalRegistry.registerDesignerIcons({
  'input': <InputIcon />,
  'button': <ButtonIcon />,
})
```

---

## 六、使用示例

### 6.1 创建设计器引擎

```typescript
import { createDesigner } from '@designable/core'

const engine = createDesigner({
  shortcuts: [],
  rootComponentName: 'Form',
  defaultComponentTree: {
    componentName: 'Form',
    props: {},
    children: [],
  },
})

// 挂载引擎
engine.mount()

// 卸载引擎
engine.unmount()
```

### 6.2 操作设计树

```typescript
// 获取当前树
const tree = engine.getCurrentTree()

// 添加节点
const newNode = engine.createNode({
  componentName: 'Input',
  props: {
    title: '输入框',
  },
})
tree.append(newNode)

// 删除节点
newNode.remove()

// 查找节点
const node = tree.find((n) => n.componentName === 'Input')
```

### 6.3 选择管理

```typescript
const operation = engine.workbench.currentWorkspace.operation

// 选择节点
operation.selection.select(node)

// 批量选择
operation.selection.batchSelect([node1, node2])

// 获取选中的节点
const selectedNodes = operation.selection.selectedNodes
```

### 6.4 历史记录

```typescript
const history = engine.workbench.currentWorkspace.history

// 撤销
history.undo()

// 重做
history.redo()

// 保存快照
history.push('add-node')
```

---

## 七、总结

### 核心价值

1. **完整的数据模型**：TreeNode、Selection、History 等
2. **事件驱动架构**：Driver → Event → Effect
3. **响应式系统**：基于 @formily/reactive
4. **可扩展性**：GlobalRegistry 注册机制

### 设计模式

- **组合模式**：TreeNode 树结构
- **策略模式**：Driver 系统
- **命令模式**：History 系统
- **注册表模式**：GlobalRegistry
- **观察者模式**：事件系统

### 学习要点

1. 理解 TreeNode 的树形结构和响应式实现
2. 理解 Driver → Event → Effect 的事件流
3. 理解 History 的快照机制
4. 理解 GlobalRegistry 的注册机制

---

**下一步**：阅读 [@designable/react 包详解](./04-react包详解.md)，了解 React 集成层的实现。
