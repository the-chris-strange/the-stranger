import parser from '@typescript-eslint/parser'

import type { Config } from 'eslint/config'

export const languageOptions = {
  parser,
  parserOptions: {
    projectService: true,
    tsconfigRootDir: process.cwd(),
  },
} satisfies Config['languageOptions']
