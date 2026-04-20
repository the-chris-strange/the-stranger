import { defineConfig } from 'eslint/config'
import * as jsoncParser from 'jsonc-eslint-parser'

import baseConfig, { SOURCE_FILES, TEST_FILES } from '../../eslint.config.mjs'

export default defineConfig(
  ...baseConfig,

  {
    files: ['**/*.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          checkVersionMismatches: false,
          ignoredFiles: [
            '{projectRoot}/eslint.config.{ts,js,cjs,mjs}',
            '{projectRoot}/src/**/*.spec.{ts,js,tsx,jsx}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
  },

  {
    files: SOURCE_FILES,
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    files: ['package.json', 'generators.json', 'executors.json'],
    languageOptions: { parser: jsoncParser },
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
  },

  {
    files: ['src/index.ts'],
    rules: {
      'unicorn/no-empty-file': 'off',
    },
  },

  {
    files: [TEST_FILES, 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
)
