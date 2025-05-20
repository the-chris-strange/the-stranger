import eslintPlugin from 'eslint-plugin-eslint-plugin'

import baseConfig from '../../eslint.config.mjs'

export default [
  eslintPlugin.configs['flat/recommended'],

  ...baseConfig,

  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
            '{projectRoot}/src/**/*.spec.{ts,js,tsx,jsx}',
          ],
          ignoredDependencies: [
            'eslint',
            'eslint-plugin-promise',
            'toml-eslint-parser',
            'yaml-eslint-parser',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
]
