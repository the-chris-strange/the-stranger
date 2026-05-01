import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

export const dependabotYamlSortConfig = [
  {
    files: ['.github/dependabot.yml'],
    name: namer('sort/dependabot'),
    rules: {
      'yml/sort-keys': [
        'warn',
        {
          order: ['package-ecosystem', { order: { type: 'asc' } }],
          pathPattern: '^updates',
        },
        { order: ['version', 'updates'], pathPattern: '^$' },
      ],
    },
  },
] satisfies ConfigWithExtends[]
