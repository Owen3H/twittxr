import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
    slowTestThreshold: 60,
    globals: true,
    bail: 5,
  },
  resolve: {
    alias: {
      '../classes': resolve(__dirname, './src/classes')
    },
  }
})