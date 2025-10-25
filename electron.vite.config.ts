import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    lib: {
      entry: 'electron/main/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['electron', 'better-sqlite3', 'fs', 'path'],
    },
  },
})

