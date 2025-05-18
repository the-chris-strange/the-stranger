import jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'

import baseConfig, { SOURCE_FILES } from '../../eslint.config.mjs'

export default tseslint.config(
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
            '{projectRoot}/vite.config.{ts,js,mjs,mts}',
            '{projectRoot}/src/**/*.spec.{ts,js,mjs,mts,tsx,jsx}',
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
    files: ['src/**/*schema.d.ts'],
    rules: {
      'perfectionist/sort-interfaces': [
        'warn',
        {
          groups: [
            'index-signature',
            'required-property',
            'optional-property',
            'method',
            'unknown',
          ],
          type: 'natural',
        },
      ],
    },
  },
)
