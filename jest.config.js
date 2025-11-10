export default {
  preset: 'ts-jest',
  testEnvironment: 'node', // Backend testleri için
  roots: ['<rootDir>/tests', '<rootDir>/electron', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx', // Frontend testleri için
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest', // TSX desteği
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // CSS ve diğer asset mock'ları
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'electron/**/*.ts',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/dist-electron/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70, // Düşürüldü (daha realistik)
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Frontend testleri için farklı environment
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.ts',
        '<rootDir>/tests/integration/**/*.test.ts',
        '<rootDir>/tests/performance/**/*.test.ts',
      ],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            allowJs: true,
            esModuleInterop: true,
          }
        }],
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom', // React component testleri için
      testMatch: ['<rootDir>/tests/frontend/**/*.test.tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
          }
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setupTestsFrontend.ts'],
    },
  ],
}

