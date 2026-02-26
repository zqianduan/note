import { Tabs } from 'antd'
import BasicForm from './examples/01-BasicForm'
import SubscriptionOptimization from './examples/02-SubscriptionOptimization'
import LargeFormPerformance from './examples/03-LargeFormPerformance'
import ConditionalFields from './examples/04-ConditionalFields'
import ArrayFields from './examples/05-ArrayFields'
import AsyncValidation from './examples/06-AsyncValidation'

function App() {
  const items = [
    {
      key: '1',
      label: '基础示例',
      children: <BasicForm />,
    },
    {
      key: '2',
      label: '订阅优化',
      children: <SubscriptionOptimization />,
    },
    {
      key: '3',
      label: '大型表单性能',
      children: <LargeFormPerformance />,
    },
    {
      key: '4',
      label: '条件字段',
      children: <ConditionalFields />,
    },
    {
      key: '5',
      label: '数组字段',
      children: <ArrayFields />,
    },
    {
      key: '6',
      label: '异步验证',
      children: <AsyncValidation />,
    },
  ]

  return (
    <div>
      <div className="app-header">
        <h1>React Final Form + Ant Design</h1>
        <p>性能优化最佳实践示例集</p>
      </div>

      <div className="demo-container">
        <Tabs defaultActiveKey="1" items={items} size="large" />
      </div>
    </div>
  )
}

export default App
