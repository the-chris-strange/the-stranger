import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export async function nxConfig(): Promise<FlatConfig.ConfigArray> {
  try {
    const nx = await import('@nx/eslint-plugin')
    return [
      nx.configs['flat/base'] as FlatConfig.Config,
      nx.configs['flat/javascript'] as FlatConfig.Config,
      nx.configs['flat/typescript'] as FlatConfig.Config,

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
    return []
  }
}

/**
 * Default configuration for [@nx/eslint-plugin](https://nx.dev/nx-api/eslint-plugin/documents/overview).
 */
export default await nxConfig()
