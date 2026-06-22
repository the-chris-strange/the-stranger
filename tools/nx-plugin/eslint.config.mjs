import { defineConfig } from 'eslint/config'
import * as jsoncParser from 'jsonc-eslint-parser'

import baseConfig from '../../eslint.config.mjs'

export default defineConfig(
  ...baseConfig,

  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{ts,js,cjs,mjs,cts,mts}',
            '{projectRoot}/src/**/*.spec.{ts,js,tsx,jsx}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
    languageOptions: { parser: jsoncParser },
  },

  {
    files: ['**/package.json', '**/generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: { parser: jsoncParser },
  },

  {
    files: ['src/index.ts'],
    rules: {
      'unicorn/no-empty-file': 'off',
    },
  },
)
