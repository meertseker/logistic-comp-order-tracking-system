import { spawn } from 'child_process'
import { createServer } from 'vite'
import electron from 'electron'

let electronProcess = null

async function startDev() {
  // Start Vite dev server
  const server = await createServer({
    configFile: './vite.config.ts',
  })

  await server.listen()
  
  console.log('✅ Vite dev server started')

  // Start Electron
  electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  })

  electronProcess.on('close', () => {
    server.close()
    process.exit()
  })
}

startDev().catch(console.error)

