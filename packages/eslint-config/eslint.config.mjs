import { defineConfig } from 'eslint/config'
import * as jsoncParser from 'jsonc-eslint-parser'

import baseConfig from '../../eslint.config.mjs'

export default defineConfig(
  ...baseConfig,

  {
    files: ['**/*.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{ts,js,cjs,mjs}',
            '{projectRoot}/src/**/*.spec.{ts,js,tsx,jsx}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
          runtimeHelpers: [
            'tslib',
            'yaml-eslint-parser',
            'toml-eslint-parser',
            'astro-eslint-parser',
          ],
        },
      ],
    },
  },
)
