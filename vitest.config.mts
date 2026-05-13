import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    projects: [
      'packages/**/vitest.config.{js,mjs,ts,mts}',
      'tools/**/vitest.config.{js,mjs,ts,mts}',
    ],
  },
})
