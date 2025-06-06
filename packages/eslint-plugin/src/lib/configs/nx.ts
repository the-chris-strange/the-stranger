import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { ConfigBuilder } from '../config-builder'

export const nxConfig: ConfigBuilder = async () => {
  try {
    const nx = await import('@nx/eslint-plugin')
    return [
      nx.configs['flat/base'] as FlatConfig.Config,
      ...nx.configs['flat/javascript'],
      ...nx.configs['flat/typescript'],

      {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        name: 'NX module boundaries rule',
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
    ]
  } catch {
    return
  }
}

export const nxDependencyChecksConfig: ConfigBuilder = async () => {
  try {
    await import('@nx/eslint-plugin')
    return {
      files: ['**/*.json'],
      languageOptions: {
        parser: await import('jsonc-eslint-parser'),
      },
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
  } catch {
    return
  }
}
