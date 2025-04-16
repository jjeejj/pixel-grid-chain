import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'assets',
    // 确保将public目录下的文件复制到dist目录
    copyPublicDir: true,
    // 调整块大小警告限制
    chunkSizeWarningLimit: 800,
  },
  // 支持Base URL设置
  base: './',
})