import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public', // Ensure public folder is copied to dist
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Production'da console.log'ları kaldır
        drop_debugger: true,
      },
    },
    // Copy public assets
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    cors: true,
  },
})

