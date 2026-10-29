import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: import.meta.dirname,
  test: {
    environment: 'node',
    include: ['*.spec.mjs'],
    name: 'consumer-smoke',
    passWithNoTests: false,
    testTimeout: 30_000,
    watch: false,
  },
})
