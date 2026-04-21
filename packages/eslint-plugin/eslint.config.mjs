import eslintPlugin from 'eslint-plugin-eslint-plugin'
import { defineConfig } from 'eslint/config'
import * as jsoncParser from 'jsonc-eslint-parser'

import baseConfig from '../../eslint.config.mjs'

export default defineConfig(
  ...baseConfig,

  {
    files: ['src/**/*.ts'],
    extends: [eslintPlugin.configs['recommended']],
  },

  {
    files: ['src/lib/configs/*.ts'],
    rules: {
      'eslint-plugin/require-meta-docs-description': 'error',
      'eslint-plugin/require-meta-docs-url': 'error',
      'eslint-plugin/require-meta-schema': 'error',
    },
  },

  {
    files: ['**/*.json'],
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
    languageOptions: { parser: jsoncParser },
  },
)
