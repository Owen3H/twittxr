import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['dotenv/config'],
    slowTestThreshold: 20000,
    testTimeout: 7000,
    globals: true,
    reporters: 'verbose',
    pool: "vmForks",
    poolOptions: {
      vmForks: {
        memoryLimit: 0.1, // 10% of sys mem
        minForks: 2, // always use 2 threads
        maxForks: 6 // 6 threads is enough
      }
    }
  },
  resolve: {
    alias: {
      '../classes': resolve(__dirname, './src/classes')
    }
  }
})