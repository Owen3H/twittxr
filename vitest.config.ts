import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
    slowTestThreshold: 20000,
    testTimeout: 7000,
    globals: true
  },
  resolve: {
    alias: {
      '../classes': resolve(__dirname, './src/classes')
    },
  }
})