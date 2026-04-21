import tseslintPlugin from 'typescript-eslint'

import type { Config } from 'eslint/config'

export const languageOptions = {
  parser: tseslintPlugin.parser,
  parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
} satisfies Config['languageOptions']
