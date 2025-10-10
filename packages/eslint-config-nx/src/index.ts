import nx from '@nx/eslint-plugin'
import { Named, namer } from '@the-stranger/eslint-plugin/utils'
import { defineConfig } from 'eslint/config'

import type { Linter } from 'eslint'

export const dependencyChecks = {
  files: ['**/*.json'],
  languageOptions: {
    parser: await import('jsonc-eslint-parser'),
  },
  name: namer('nx-dependency-checks'),
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
} satisfies Named<Linter.Config>

export default defineConfig(
  nx.configs['flat/base'],
  nx.configs['flat/javascript'] as Linter.Config,
  nx.configs['flat/typescript'] as Linter.Config,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    name: namer('nx-module-boundaries'),
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            {
              onlyDependOnLibsWithTags: ['*'],
              sourceTag: '*',
            },
          ],
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },
)
