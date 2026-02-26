import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

// 获取 __dirname 的 ES 模块替代方案
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 解决 antd less 文件中 ~ 引用问题
      '~antd': path.resolve(__dirname, './node_modules/antd'),
      '~@ant-design': path.resolve(__dirname, './node_modules/@ant-design'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // 启用 JavaScript
        javascriptEnabled: true,
        // 修改主题变量（可选）
        modifyVars: {
          '@primary-color': '#1890ff',
        },
      },
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@formily/core',
      '@formily/react',
      '@formily/reactive',
      '@formily/antd',
      'antd',
    ],
  },
})
