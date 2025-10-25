import { build } from 'esbuild'
import { spawn } from 'child_process'

let electronProcess = null

const buildMain = async () => {
  await build({
    entryPoints: ['electron/main/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/main/index.cjs',
    external: ['electron', 'better-sqlite3'],
    format: 'cjs',
    sourcemap: true,
  })
}

const buildPreload = async () => {
  await build({
    entryPoints: ['electron/preload/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/preload/index.cjs',
    external: ['electron'],
    format: 'cjs',
    sourcemap: true,
  })
}

const startElectron = () => {
  if (electronProcess) {
    electronProcess.kill()
  }

  // Use npx electron for cross-platform compatibility
  const isWindows = process.platform === 'win32'
  const electronCmd = isWindows ? 'npx.cmd' : 'npx'
  const electronArgs = isWindows ? ['electron', '.'] : ['electron', '.']

  electronProcess = spawn(electronCmd, electronArgs, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
    },
  })

  electronProcess.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`Electron exited with code ${code}`)
    }
  })
}

const watchElectron = async () => {
  console.log('🔨 Building Electron...')
  
  await Promise.all([buildMain(), buildPreload()])
  
  console.log('✅ Electron built successfully')
  console.log('🚀 Starting Electron...')
  
  startElectron()
}

watchElectron().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})

