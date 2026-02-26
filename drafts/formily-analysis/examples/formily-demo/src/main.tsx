import React from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import 'antd/dist/antd.css'
import moment from 'moment'
import 'moment/locale/zh-cn'
import App from './App'
import './index.css'

moment.locale('zh-cn')

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
