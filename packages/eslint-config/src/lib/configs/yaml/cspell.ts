import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

export const cspellYamlSortConfig = [
  {
    files: ['cspell.config.yaml', '**/cspell.config.yaml'],
    name: namer('sort/cspell-config'),
    rules: {
      'yml/sort-keys': [
        'warn',
        {
          order: [
            'version',
            'language',
            'import',
            'ignorePaths',
            'dictionaries',
            'ignoreWords',
            'words',
            'languageSettings',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: ['languageId', 'dictionaries', { order: { type: 'asc' } }],
          pathPattern: 'languageSettings$',
        },
      ],
      'yml/sort-sequence-values': [
        'warn',
        {
          order: { type: 'asc' },
          pathPattern: 'dictionaries|import|ignorePaths|ignoreWords|words$',
        },
      ],
    },
  },
] satisfies ConfigWithExtends[]
