import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

const topLevelAscKeys = ['on', 'permissions', 'defaults'].join('|')

export const githubActionsYamlSortConfig: ConfigWithExtends[] = [
  {
    files: ['.github/workflows/*.yml'],
    name: namer('sort/github-actions'),
    rules: {
      'yml/no-empty-mapping-values': 'off',
      'yml/sort-keys': [
        'error',
        {
          order: [
            'name',
            'on',
            'permissions',
            'env',
            'defaults',
            'concurrency',
            'jobs',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: { type: 'asc' },
          pathPattern: `^${topLevelAscKeys}`,
        },
        {
          order: [
            'id',
            'name',
            'if',
            'run',
            'uses',
            'with',
            'env',
            { order: { type: 'asc' } },
          ],
          pathPattern: String.raw`^jobs\..+steps`,
        },
        {
          order: [
            'strategy',
            'name',
            'if',
            'needs',
            'runs-on',
            'permissions',
            'environment',
            'env',
            'concurrency',
            'timeout-minutes',
            'outputs',
            'defaults',
            'steps',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^jobs',
        },
      ],
      'yml/sort-sequence-values': [
        'error',
        {
          order: { type: 'asc' },
          pathPattern: `^${topLevelAscKeys}`,
        },
      ],
    },
  },
]
