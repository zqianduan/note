/**
 * Designable Formily Antd Playground Demo
 *
 * 这是一个基于 Designable 的表单设计器完整示例，展示了如何使用 Designable
 * 构建一个可视化的低代码表单设计工具。
 */

// Ant Design 样式
import 'antd/dist/antd.less'
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'

// @designable/react - 核心 UI 组件
// Designer: 设计器容器，提供全局上下文
// StudioPanel/CompositePanel/WorkspacePanel: 布局面板组件
// ResourceWidget: 组件资源面板
// ComponentTreeWidget: 组件树渲染器
import {
  Designer,
  DesignerToolsWidget,
  ViewToolsWidget,
  Workspace,
  OutlineTreeWidget,
  ResourceWidget,
  HistoryWidget,
  StudioPanel,
  CompositePanel,
  WorkspacePanel,
  ToolbarPanel,
  ViewportPanel,
  ViewPanel,
  SettingsPanel,
  ComponentTreeWidget,
} from '@designable/react'

// @designable/react-settings-form - 属性配置表单
import {
  SettingsForm,
  setNpmCDNRegistry,
} from '@designable/react-settings-form'

// @designable/core - 核心引擎
// createDesigner: 创建设计器引擎实例
// GlobalRegistry: 全局注册表，用于注册语言包、图标等
// Shortcut: 快捷键定义
import {
  createDesigner,
  GlobalRegistry,
  Shortcut,
  KeyCode,
} from '@designable/core'

// 自定义 Widget 组件
import {
  LogoWidget,
  ActionsWidget,
  PreviewWidget,
  SchemaEditorWidget,
  MarkupSchemaWidget,
} from './widgets'
import { saveSchema } from './service'

// @designable/formily-antd - Formily + Ant Design 表单组件
// 这些组件都是经过 Designable 包装的，支持拖拽设计
import {
  Form,
  Field,
  Input,
  Select,
  TreeSelect,
  Cascader,
  Radio,
  Checkbox,
  Slider,
  Rate,
  NumberPicker,
  Transfer,
  Password,
  DatePicker,
  TimePicker,
  Upload,
  Switch,
  Text,
  Card,
  ArrayCards,
  ObjectContainer,
  ArrayTable,
  Space,
  FormTab,
  FormCollapse,
  FormLayout,
  FormGrid,
} from '@designable/formily-antd'

// 设置 NPM CDN 地址，用于加载远程组件资源
setNpmCDNRegistry('//unpkg.com')

// 注册多语言资源，支持中文、英文、韩文
// sources 对应左侧组件面板的分类标题
GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    sources: {
      Inputs: '输入控件',
      Layouts: '布局组件',
      Arrays: '自增组件',
      Displays: '展示组件',
    },
  },
  'en-US': {
    sources: {
      Inputs: 'Inputs',
      Layouts: 'Layouts',
      Arrays: 'Arrays',
      Displays: 'Displays',
    },
  },
  'ko-KR': {
    sources: {
      Inputs: '입력',
      Layouts: '레이아웃',
      Arrays: '배열',
      Displays: '디스플레이',
    },
  },
})

/**
 * 主应用组件
 *
 * 架构说明：
 * 1. Designer - 设计器容器，管理全局状态
 * 2. StudioPanel - 工作室面板，包含 Logo、操作按钮等
 * 3. CompositePanel - 左侧复合面板，包含组件库、大纲树、历史记录
 * 4. Workspace - 工作区，包含画布和工具栏
 * 5. SettingsPanel - 右侧属性配置面板
 */
const App = () => {
  // 创建设计器引擎实例
  // useMemo 确保引擎只创建一次
  const engine = useMemo(
    () =>
      createDesigner({
        // 快捷键配置：Cmd+S / Ctrl+S 保存 Schema
        shortcuts: [
          new Shortcut({
            codes: [
              [KeyCode.Meta, KeyCode.S],   // Mac: Cmd+S
              [KeyCode.Control, KeyCode.S], // Windows/Linux: Ctrl+S
            ],
            handler(ctx) {
              saveSchema(ctx.engine)
            },
          }),
        ],
        // 根组件类型为 Form
        rootComponentName: 'Form',
      }),
    []
  )
  return (
    <Designer engine={engine}>
      {/* 工作室主面板 */}
      <StudioPanel logo={<LogoWidget />} actions={<ActionsWidget />}>
        {/* 左侧复合面板：包含组件库、大纲树、历史记录 */}
        <CompositePanel>
          {/* 组件面板：可拖拽的组件库 */}
          <CompositePanel.Item title="panels.Component" icon="Component">
            {/* 输入控件分组 */}
            <ResourceWidget
              title="sources.Inputs"
              sources={[
                Input,
                Password,
                NumberPicker,
                Rate,
                Slider,
                Select,
                TreeSelect,
                Cascader,
                Transfer,
                Checkbox,
                Radio,
                DatePicker,
                TimePicker,
                Upload,
                Switch,
                ObjectContainer,
              ]}
            />
            {/* 布局组件分组 */}
            <ResourceWidget
              title="sources.Layouts"
              sources={[
                Card,
                FormGrid,
                FormTab,
                FormLayout,
                FormCollapse,
                Space,
              ]}
            />
            {/* 自增组件分组：数组类型的容器 */}
            <ResourceWidget
              title="sources.Arrays"
              sources={[ArrayCards, ArrayTable]}
            />
            {/* 展示组件分组 */}
            <ResourceWidget title="sources.Displays" sources={[Text]} />
          </CompositePanel.Item>
          {/* 大纲树面板：显示组件树形结构 */}
          <CompositePanel.Item title="panels.OutlinedTree" icon="Outline">
            <OutlineTreeWidget />
          </CompositePanel.Item>
          {/* 历史记录面板：支持撤销/重做 */}
          <CompositePanel.Item title="panels.History" icon="History">
            <HistoryWidget />
          </CompositePanel.Item>
        </CompositePanel>
        {/* 中间工作区 */}
        <Workspace id="form">
          <WorkspacePanel>
            {/* 工具栏：包含设计工具和视图切换按钮 */}
            <ToolbarPanel>
              <DesignerToolsWidget />
              {/* 视图切换：设计视图、JSON树、标记语言、预览 */}
              <ViewToolsWidget
                use={['DESIGNABLE', 'JSONTREE', 'MARKUP', 'PREVIEW']}
              />
            </ToolbarPanel>
            {/* 视口面板：主画布区域 */}
            <ViewportPanel style={{ height: '100%' }}>
              {/* 设计视图：可视化拖拽编辑 */}
              <ViewPanel type="DESIGNABLE">
                {() => (
                  <ComponentTreeWidget
                    components={{
                      Form,
                      Field,
                      Input,
                      Select,
                      TreeSelect,
                      Cascader,
                      Radio,
                      Checkbox,
                      Slider,
                      Rate,
                      NumberPicker,
                      Transfer,
                      Password,
                      DatePicker,
                      TimePicker,
                      Upload,
                      Switch,
                      Text,
                      Card,
                      ArrayCards,
                      ArrayTable,
                      Space,
                      FormTab,
                      FormCollapse,
                      FormGrid,
                      FormLayout,
                      ObjectContainer,
                    }}
                  />
                )}
              </ViewPanel>
              {/* JSON 树视图：以 JSON 格式编辑 Schema */}
              <ViewPanel type="JSONTREE" scrollable={false}>
                {(tree, onChange) => (
                  <SchemaEditorWidget tree={tree} onChange={onChange} />
                )}
              </ViewPanel>
              {/* 标记语言视图：以 JSX/Vue 等标记语言展示 */}
              <ViewPanel type="MARKUP" scrollable={false}>
                {(tree) => <MarkupSchemaWidget tree={tree} />}
              </ViewPanel>
              {/* 预览视图：查看最终渲染效果 */}
              <ViewPanel type="PREVIEW">
                {(tree) => <PreviewWidget tree={tree} />}
              </ViewPanel>
            </ViewportPanel>
          </WorkspacePanel>
        </Workspace>
        {/* 右侧属性设置面板 */}
        <SettingsPanel title="panels.PropertySettings">
          <SettingsForm uploadAction="https://www.mocky.io/v2/5cc8019d300000980a055e76" />
        </SettingsPanel>
      </StudioPanel>
    </Designer>
  )
}

// 渲染应用到 DOM
ReactDOM.render(<App />, document.getElementById('root'))
