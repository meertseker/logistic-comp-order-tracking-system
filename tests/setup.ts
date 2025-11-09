/**
 * Jest Test Setup
 * Tüm testlerden önce çalıştırılır
 */

// Mock Electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      if (name === 'userData') {
        return '/tmp/test-userdata'
      }
      return '/tmp'
    }),
    whenReady: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(() => ({
    loadURL: jest.fn(),
    loadFile: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    show: jest.fn(),
    webContents: {
      openDevTools: jest.fn(),
    },
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  },
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    send: jest.fn(),
  },
}))

// DON'T mock better-sqlite3 - use real instance for tests
// jest.mock('better-sqlite3', () => {
//   return jest.fn(() => ({
//     prepare: jest.fn((sql: string) => ({
//       run: jest.fn(),
//       get: jest.fn(),
//       all: jest.fn(() => []),
//     })),
//     exec: jest.fn(),
//     pragma: jest.fn(),
//     close: jest.fn(),
//   }))
// })

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(), // Suppress error logs in tests
  warn: jest.fn(),
}

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})

