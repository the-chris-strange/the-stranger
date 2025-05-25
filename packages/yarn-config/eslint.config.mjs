import jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'

import baseConfig from '../../eslint.config.mjs'

export default tseslint.config(
  ...baseConfig,

  {
    files: ['**/*.json'],
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
    languageOptions: { parser: jsoncParser },
  },
)
