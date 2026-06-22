import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

export const tsconfigJsonSortConfig: ConfigWithExtends[] = [
  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    name: namer('json/tsconfig'),
    rules: {
      'jsonc/sort-keys': [
        'warn',
        {
          order: [
            'extends',
            'compilerOptions',
            'files',
            'include',
            'exclude',
            'references',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: ['paths', { order: { type: 'asc' } }],
          pathPattern: '^compilerOptions$',
        },
        {
          order: [{ order: { type: 'asc' } }],
          pathPattern: String.raw`^compilerOptions\.paths$`,
        },
      ],
    },
  },
]
