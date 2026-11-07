import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['features/**/*.test.ts'],
    exclude: ['node_modules', 'e2e', '.next'],
    root,
  },
  resolve: {
    alias: {
      '@': path.resolve(root),
    },
  },
})
