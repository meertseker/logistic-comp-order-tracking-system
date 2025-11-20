import { defineConfig } from 'vite'
import { builtinModules } from 'module'

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    lib: {
      entry: 'electron/main/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-updater',
        'electron-log',
        'better-sqlite3',
        'nodemailer',
        'html-to-text',
        'node-machine-id',
        'systeminformation',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
    },
  },
})

