import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildElectron() {
  try {
    // Build main process
    await build({
      configFile: false,
      build: {
        outDir: path.resolve(__dirname, '../dist-electron/main'),
        lib: {
          entry: path.resolve(__dirname, '../electron/main/index.ts'),
          formats: ['cjs'],
          fileName: () => 'index.cjs',
        },
        rollupOptions: {
          external: [
            'electron', 
            'better-sqlite3', 
            'fs', 
            'fs/promises',
            'path', 
            'crypto', 
            'os', 
            'child_process',
            'node-machine-id',
            'systeminformation',
            'util',
            'https',
            'http',
            'net'
          ],
          output: {
            format: 'cjs',
            inlineDynamicImports: false,
          }
        },
        target: 'node18',
        minify: false,
        emptyOutDir: true,
      },
      resolve: {
        conditions: ['node'],
      },
    })

    // Build preload script
    await build({
      configFile: false,
      build: {
        outDir: path.resolve(__dirname, '../dist-electron/preload'),
        lib: {
          entry: path.resolve(__dirname, '../electron/preload/index.ts'),
          formats: ['cjs'],
          fileName: () => 'index.cjs',
        },
        rollupOptions: {
          external: ['electron'],
        },
        emptyOutDir: true,
      },
    })

    console.log('✅ Electron build completed successfully')
  } catch (error) {
    console.error('❌ Electron build failed:', error)
    process.exit(1)
  }
}

buildElectron()

