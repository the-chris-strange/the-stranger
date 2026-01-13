import nx from '@nx/eslint-plugin'

import type { Linter } from 'eslint'

import { type Named, namer } from '../namer.js'

export const dependencyChecks: Named<Linter.Config> = {
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
}

export default [
  nx.configs['flat/base'],
  nx.configs['flat/javascript'],
  nx.configs['flat/typescript'],

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
] as Linter.Config[]
