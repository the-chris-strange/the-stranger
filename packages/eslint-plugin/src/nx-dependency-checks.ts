import type { Linter } from '@typescript-eslint/utils/ts-eslint'

export default {
  files: ['**/*.json'],
  languageOptions: {
    parser: await import('jsonc-eslint-parser'),
  },
  rules: {
    '@nx/dependency-checks': [
      'error',
      {
        ignoredFiles: [
          '{projectRoot}/eslint.config.{js,cjs,mjs}',
          '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          '{projectRoot}/src/**/*.spec.{ts,js,mjs,mts,tsx,jsx}',
        ],
      },
    ],
  },
} satisfies Linter.ConfigType
