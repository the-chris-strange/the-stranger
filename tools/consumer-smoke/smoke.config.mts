import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: import.meta.dirname,
  test: {
    environment: 'node',
    include: ['*.spec.mjs'],
    name: 'consumer-smoke',
    passWithNoTests: false,
    testTimeout: 30000,
    watch: false,
  },
})
