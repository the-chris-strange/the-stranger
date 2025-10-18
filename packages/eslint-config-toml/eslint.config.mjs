import { defineConfig } from 'eslint/config'
import jsoncParser from 'jsonc-eslint-parser'

import baseConfig from '../../eslint.config.mjs'

export default defineConfig(
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
          ignoredDependencies: [
            // this is included in the toml plugin's recommended config, so isn't directly imported by this project
            'toml-eslint-parser',
          ],
        },
      ],
    },
    languageOptions: { parser: jsoncParser },
  },
)
