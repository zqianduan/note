# @designable/shared 包详解

## 一、包概述

`@designable/shared` 是 Designable 的基础工具库，提供了整个框架所需的通用工具函数、数据结构和设计模式实现。它是所有其他包的依赖基础。

### 包信息

- **位置**：`/packages/shared`
- **依赖**：`requestidlecallback`（polyfill）
- **输出格式**：CJS、ESM、UMD
- **核心模块**：15+ 个工具模块

## 二、核心模块详解

### 2.1 Event（事件系统）

位置：`src/event.ts`

#### 2.1.1 Subscribable（订阅系统）

**核心实现**：

```typescript
export class Subscribable<ExtendsType = any> {
  private subscribers: {
    index?: number
    [key: number]: ISubscriber
  } = {
    index: 0,
  }

  // 分发事件
  dispatch<T extends ExtendsType = any>(event: T, context?: any) {
    let interrupted = false
    for (const key in this.subscribers) {
      if (isFn(this.subscribers[key])) {
        event['context'] = context
        if (this.subscribers[key](event) === false) {
          interrupted = true
        }
      }
    }
    return interrupted ? false : true
  }

  // 订阅事件
  subscribe(subscriber: ISubscriber) {
    let id: number
    if (isFn(subscriber)) {
      id = this.subscribers.index + 1
      this.subscribers[id] = subscriber
      this.subscribers.index++
    }

    const unsubscribe = () => {
      this.unsubscribe(id)
    }

    unsubscribe[UNSUBSCRIBE_ID_SYMBOL] = id
    return unsubscribe
  }

  // 取消订阅
  unsubscribe = (id?: number | string | (() => void)) => {
    if (id === undefined || id === null) {
      for (const key in this.subscribers) {
        this.unsubscribe(key)
      }
      return
    }
    if (!isFn(id)) {
      delete this.subscribers[id]
    } else {
      delete this.subscribers[id[UNSUBSCRIBE_ID_SYMBOL]]
    }
  }
}
```

**设计亮点**：

1. **数字索引管理**：使用对象 + 数字索引而非数组，避免删除时的性能问题
2. **中断机制**：订阅者返回 false 可中断后续订阅者的执行
3. **符号标记**：使用 Symbol 存储取消订阅的 ID，避免命名冲突
4. **灵活的取消订阅**：支持传入 ID、函数或不传参（清空所有）

#### 2.1.2 Event（事件基类）

```typescript
export class Event extends Subscribable {
  // 事件驱动器实例
  private [DRIVER_INSTANCES_SYMBOL]: IEventDriver[] = []

  // 附加事件监听
  attachEvents(container: EventContainer, contentWindow?: Window, context?: any) {
    this.drivers.forEach((driver) => {
      const instance = new driver(this, context)
      instance.attach(container)
      this[DRIVER_INSTANCES_SYMBOL].push(instance)
    })
  }

  // 分离事件监听
  detachEvents() {
    this[DRIVER_INSTANCES_SYMBOL].forEach((driver) => {
      driver.detach()
    })
    this[DRIVER_INSTANCES_SYMBOL] = []
  }
}
```

**设计亮点**：

1. **Driver 模式**：通过 Driver 封装不同的事件处理策略
2. **生命周期管理**：attach/detach 管理事件监听的生命周期
3. **上下文传递**：支持传递上下文给 Driver

#### 2.1.3 EventDriver（事件驱动器基类）

```typescript
export class EventDriver<T = Event> implements IEventDriver {
  container: EventDriverContainer
  contentWindow: Window
  engine: T

  constructor(engine: T, context?: any) {
    this.engine = engine
    this.context = context
  }

  // 附加到容器
  attach(container: EventDriverContainer): void {
    this.container = container
    this.contentWindow = container?.ownerDocument?.defaultView || window
  }

  // 分离
  detach(): void {
    this.batchRemoveEventListener()
  }

  // 分发自定义事件
  dispatch<T extends ICustomEvent<any> = any>(event: T): void | boolean {
    return this.engine.dispatch(event, this.context)
  }

  // 订阅自定义事件
  subscribe<T extends ICustomEvent<any> = any>(subscriber: ISubscriber<T>): void {
    this.engine.subscribe(subscriber)
  }

  // 批量添加事件监听
  batchAddEventListener(type: string, listener: any, options?: any): void {
    // 实现批量事件监听
  }

  // 批量移除事件监听
  batchRemoveEventListener(type?: string, listener?: any, options?: any): void {
    // 实现批量移除
  }
}
```

**设计亮点**：

1. **批量事件管理**：batchAddEventListener 支持一次性添加多个事件
2. **自动清理**：detach 时自动移除所有事件监听
3. **事件桥接**：将原生事件转换为自定义事件

### 2.2 Coordinate（坐标计算）

位置：`src/coordinate.ts`

提供坐标系统相关的工具函数：

```typescript
// 计算点到矩形的距离
export const calcDistancePointToEdge = (point: IPoint, rect: IRect): number => {
  // 实现点到矩形边缘的最短距离计算
}

// 判断点是否在矩形内
export const isPointInRect = (point: IPoint, rect: IRect, sensitive = true): boolean => {
  // 实现点与矩形的碰撞检测
}

// 计算矩形的边界
export const calcBoundingRect = (rects: IRect[]): IRect => {
  // 计算多个矩形的包围盒
}

// 判断矩形是否相交
export const isRectInRect = (target: IRect, source: IRect): boolean => {
  // 实现矩形相交检测
}
```

**应用场景**：

- 拖拽时的碰撞检测
- 选择框的范围计算
- 对齐线的距离计算

### 2.3 LRU Cache（LRU 缓存）

位置：`src/lru.ts`

实现了 LRU（Least Recently Used）缓存算法：

```typescript
export class LRUCache<T = any> {
  private cache: Map<string, T>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    if (!this.cache.has(key)) return undefined
    // 移到最后（最近使用）
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.cache.set(key, value)
    // 超过最大容量，删除最早的
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }
}
```

**设计亮点**：

1. **Map 实现**：利用 Map 的插入顺序特性
2. **自动淘汰**：超过容量自动删除最久未使用的项
3. **O(1) 复杂度**：get 和 set 操作都是常数时间

**应用场景**：

- 缓存计算结果
- 缓存 DOM 查询结果
- 缓存组件实例

### 2.4 Scroller（滚动工具）

位置：`src/scroller.ts`

提供滚动相关的工具函数：

```typescript
// 获取滚动容器
export const getScrollParent = (node: HTMLElement): HTMLElement => {
  // 向上查找可滚动的父元素
}

// 滚动到指定位置
export const scrollIntoView = (
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void => {
  // 实现平滑滚动
}

// 判断元素是否在可视区域
export const isElementVisible = (
  element: HTMLElement,
  container?: HTMLElement
): boolean => {
  // 判断元素是否可见
}
```

**应用场景**：

- 拖拽时的自动滚动
- 选中节点时滚动到可视区域
- 虚拟滚动的可见性判断

### 2.5 Animation（动画工具）

位置：`src/animation.ts`

提供动画相关的工具：

```typescript
// 请求动画帧（带 polyfill）
export const requestIdle = (callback: () => void, timeout?: number): number => {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, { timeout })
  }
  return setTimeout(callback, 16) as any
}

// 取消动画帧
export const cancelIdle = (id: number): void => {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}
```

**设计亮点**：

1. **Polyfill**：兼容不支持 requestIdleCallback 的浏览器
2. **性能优化**：利用浏览器空闲时间执行任务

**应用场景**：

- 历史记录快照（延迟保存）
- 大量 DOM 操作的分批处理
- 非关键任务的延迟执行

### 2.6 Observer（观察者工具）

位置：`src/observer.ts`

提供观察者模式的工具函数：

```typescript
// 观察 DOM 变化
export const observeResize = (
  element: HTMLElement,
  callback: (entry: ResizeObserverEntry) => void
): () => void => {
  const observer = new ResizeObserver((entries) => {
    entries.forEach(callback)
  })
  observer.observe(element)
  return () => observer.disconnect()
}

// 观察 DOM 属性变化
export const observeMutation = (
  element: HTMLElement,
  callback: (mutations: MutationRecord[]) => void,
  options?: MutationObserverInit
): () => void => {
  const observer = new MutationObserver(callback)
  observer.observe(element, options)
  return () => observer.disconnect()
}
```

**应用场景**：

- 监听视口大小变化
- 监听 DOM 结构变化
- 监听属性变化

### 2.7 Clone（深拷贝）

位置：`src/clone.ts`

实现深拷贝功能：

```typescript
export const clone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof RegExp) return new RegExp(obj) as any
  if (obj instanceof Array) {
    return obj.map((item) => clone(item)) as any
  }
  if (obj instanceof Object) {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = clone(obj[key])
      }
    }
    return cloned
  }
  return obj
}
```

**设计亮点**：

1. **类型保留**：正确处理 Date、RegExp 等特殊类型
2. **递归拷贝**：深度拷贝嵌套对象
3. **性能优化**：避免不必要的拷贝

**应用场景**：

- 历史记录快照
- 节点克隆
- 属性拷贝

### 2.8 Array（数组工具）

位置：`src/array.ts`

提供数组操作的工具函数：

```typescript
// 数组去重
export const unique = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr))
}

// 数组扁平化
export const flatten = <T>(arr: T[][]): T[] => {
  return arr.reduce((acc, val) => acc.concat(val), [])
}

// 数组分组
export const groupBy = <T>(
  arr: T[],
  fn: (item: T) => string
): Record<string, T[]> => {
  return arr.reduce((acc, item) => {
    const key = fn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}
```

### 2.9 KeyCode（键盘码）

位置：`src/keycode.ts`

提供键盘码的常量和工具：

```typescript
export const KeyCode = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Ctrl: 17,
  Alt: 18,
  Escape: 27,
  Space: 32,
  Delete: 46,
  // ... 更多键码
}

// 判断是否按下修饰键
export const isModifierKey = (event: KeyboardEvent): boolean => {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
}

// 获取快捷键字符串
export const getShortcutKey = (event: KeyboardEvent): string => {
  const keys: string[] = []
  if (event.ctrlKey || event.metaKey) keys.push('Ctrl')
  if (event.shiftKey) keys.push('Shift')
  if (event.altKey) keys.push('Alt')
  keys.push(event.key)
  return keys.join('+')
}
```

**应用场景**：

- 快捷键处理
- 键盘事件判断
- 快捷键提示

### 2.10 Types（类型判断）

位置：`src/types.ts`

提供类型判断的工具函数：

```typescript
export const isFn = (val: any): val is Function => typeof val === 'function'
export const isStr = (val: any): val is string => typeof val === 'string'
export const isNum = (val: any): val is number => typeof val === 'number'
export const isBool = (val: any): val is boolean => typeof val === 'boolean'
export const isObj = (val: any): val is object => typeof val === 'object' && val !== null
export const isArr = Array.isArray
export const isWindow = (val: any): val is Window => val === window
export const isHTMLElement = (val: any): val is HTMLElement => val instanceof HTMLElement
```

**设计亮点**：

1. **类型守卫**：使用 TypeScript 的类型守卫语法
2. **完整性**：覆盖常见的类型判断场景
3. **性能**：使用最快的判断方式

### 2.11 UID（唯一 ID 生成）

位置：`src/uid.ts`

生成唯一 ID：

```typescript
let IDX = 0

export const uid = (prefix = 'id'): string => {
  return `${prefix}_${IDX++}_${Date.now()}`
}
```

**设计亮点**：

1. **唯一性保证**：递增序号 + 时间戳
2. **可读性**：支持自定义前缀
3. **性能**：简单高效

**应用场景**：

- TreeNode ID 生成
- 临时节点标识
- 事件 ID 生成

## 三、设计模式总结

### 3.1 观察者模式

- **Subscribable**：实现发布-订阅模式
- **Event**：事件系统基类
- **EventDriver**：事件驱动器

### 3.2 策略模式

- **EventDriver**：不同的事件处理策略

### 3.3 单例模式

- **GlobalThisPolyfill**：全局对象的单例

## 四、性能优化技巧

### 4.1 LRU 缓存

使用 LRU 缓存避免重复计算：

```typescript
const cache = new LRUCache<DOMRect>(100)

function getElementRect(element: HTMLElement): DOMRect {
  const key = element.getAttribute('data-id')
  if (cache.has(key)) {
    return cache.get(key)
  }
  const rect = element.getBoundingClientRect()
  cache.set(key, rect)
  return rect
}
```

### 4.2 requestIdleCallback

利用浏览器空闲时间执行非关键任务：

```typescript
requestIdle(() => {
  // 执行非关键任务，如保存历史记录
  history.push()
})
```

### 4.3 事件批量处理

批量添加/移除事件监听，减少重复操作：

```typescript
driver.batchAddEventListener('mousedown', handler1)
driver.batchAddEventListener('mousemove', handler2)
driver.batchAddEventListener('mouseup', handler3)
```

## 五、使用示例

### 5.1 使用 Subscribable

```typescript
import { Subscribable } from '@designable/shared'

const eventBus = new Subscribable()

// 订阅事件
const unsubscribe = eventBus.subscribe((event) => {
  console.log('收到事件:', event)
  // 返回 false 可中断后续订阅者
  return true
})

// 分发事件
eventBus.dispatch({ type: 'test', data: 'hello' })

// 取消订阅
unsubscribe()
```

### 5.2 使用 EventDriver

```typescript
import { EventDriver } from '@designable/shared'

class MyDriver extends EventDriver {
  attach(container: HTMLElement) {
    super.attach(container)
    this.batchAddEventListener('click', this.onClick)
  }

  onClick = (e: MouseEvent) => {
    this.dispatch({
      type: 'custom-click',
      data: { x: e.clientX, y: e.clientY }
    })
  }
}
```

### 5.3 使用 LRU Cache

```typescript
import { LRUCache } from '@designable/shared'

const cache = new LRUCache<string>(50)

cache.set('key1', 'value1')
cache.set('key2', 'value2')

console.log(cache.get('key1')) // 'value1'
```

## 六、总结

### 6.1 核心价值

1. **基础工具库**：提供通用的工具函数和数据结构
2. **设计模式实现**：封装常用的设计模式
3. **性能优化**：提供性能优化的工具和策略
4. **类型安全**：完整的 TypeScript 类型定义

### 6.2 学习要点

1. **Subscribable**：理解发布-订阅模式的实现
2. **EventDriver**：理解事件驱动的架构
3. **LRU Cache**：理解缓存策略的应用
4. **性能优化**：学习 requestIdleCallback 等优化技巧

### 6.3 最佳实践

1. **使用 LRU 缓存**：避免重复计算
2. **使用 requestIdleCallback**：延迟非关键任务
3. **使用批量事件处理**：减少重复操作
4. **使用类型守卫**：提高类型安全性

---

**下一步**：阅读 [@designable/core 包详解](./03-core包详解.md)，深入理解核心引擎的实现。
