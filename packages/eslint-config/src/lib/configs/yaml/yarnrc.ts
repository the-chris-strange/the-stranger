import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

export const yarnrcYamlSortConfig: ConfigWithExtends[] = [
  {
    files: ['.yarnrc.yml'],
    name: namer('sort/yarnrc'),
    rules: {
      'yml/sort-keys': ['error', { order: { type: 'asc' }, pathPattern: '^$' }],
      'yml/sort-sequence-values': [
        'error',
        {
          order: ['.env?', { order: { type: 'asc' } }],
          pathPattern: '^injectEnvironmentFiles',
        },
      ],
    },
  },
]
