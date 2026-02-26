import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里自定义 antd 主题变量
        },
        // 关键：添加 paths 配置来解析 ~ 别名
        paths: [
          path.resolve(__dirname, 'node_modules')
        ]
      }
    }
  },
  resolve: {
    alias: [
      // 解决 ~antd 别名问题
      {
        find: /^~antd/,
        replacement: path.resolve(__dirname, 'node_modules/antd')
      },
      {
        find: /^~/,
        replacement: path.resolve(__dirname, 'node_modules')
      }
    ]
  }
})
