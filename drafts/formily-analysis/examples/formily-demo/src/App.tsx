import React, { useState } from 'react'
import { Tabs } from 'antd'

// 基础组件示例
import BasicFieldDemo from './examples/01-BasicField'
import ArrayFieldDemo from './examples/02-ArrayField'
import ObjectFieldDemo from './examples/03-ObjectField'
import VoidFieldDemo from './examples/04-VoidField'

// Hooks 示例
import HooksDemo from './examples/05-Hooks'
import FormEffectsDemo from './examples/06-FormEffects'

// 高级示例
import LargeFormDemo from './examples/07-LargeForm'
import JsonSchemaDemo from './examples/08-JsonSchema'
import ReactionDemo from './examples/09-Reactions'

// 综合示例
import ComplexFormDemo from './examples/10-ComplexForm'
import EffectsDemo from './examples/11-EffectsDemo'
import ReactBindingDemo from './examples/12-ReactBinding'

const { TabPane } = Tabs

/**
 * Formily 演示应用主组件
 *
 * 这个应用展示了 @formily/react 和 @formily/core 的所有核心功能：
 * - 基础组件：Field, ArrayField, ObjectField, VoidField
 * - Hooks：useForm, useField, useFormEffects 等
 * - 高级特性：大表单优化、JSON Schema、响应式联动
 */
const App: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <div>
      {/* 页面头部 */}
      <div className="app-header">
        <h1>Formily 完整示例集</h1>
        <p>
          基于 @formily/core + @formily/react + Ant Design 4.15.0 的完整演示
        </p>
      </div>

      {/* 主容器 */}
      <div className="app-container">
        <Tabs activeKey={activeKey} onChange={setActiveKey} size="large">
          <TabPane tab="01. 基础 Field" key="1">
            <BasicFieldDemo />
          </TabPane>
          <TabPane tab="02. ArrayField 数组" key="2">
            <ArrayFieldDemo />
          </TabPane>
          <TabPane tab="03. ObjectField 对象" key="3">
            <ObjectFieldDemo />
          </TabPane>
          <TabPane tab="04. VoidField 虚拟" key="4">
            <VoidFieldDemo />
          </TabPane>
          <TabPane tab="05. Hooks 钩子" key="5">
            <HooksDemo />
          </TabPane>
          <TabPane tab="06. FormEffects 副作用" key="6">
            <FormEffectsDemo />
          </TabPane>
          <TabPane tab="07. 大表单 (1000+ 字段)" key="7">
            <LargeFormDemo />
          </TabPane>
          <TabPane tab="08. JSON Schema" key="8">
            <JsonSchemaDemo />
          </TabPane>
          <TabPane tab="09. Reactions 联动" key="9">
            <ReactionDemo />
          </TabPane>
          <TabPane tab="10. 综合示例" key="10">
            <ComplexFormDemo />
          </TabPane>
          <TabPane tab="11. Effects 机制" key="11">
            <EffectsDemo />
          </TabPane>
          <TabPane tab="12. React 组件绑定" key="12">
            <ReactBindingDemo />
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}

export default App
