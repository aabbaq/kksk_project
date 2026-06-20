import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    globalSetup: ['./setup/global-setup.ts'],
    setupFiles: ['./setup/test-setup.ts'],
    server: {
      deps: {
        inline: ['@kksk/shared']
      }
    }
  },
  resolve: {
    alias: {
      '@kksk/shared': path.resolve(__dirname, '../packages/shared/src/index.ts')
    }
  }
})
