import type { ConfigWithExtends } from '../../../extend-config.js'

import { namer } from '../../../namer.js'

export const vscodeJsonSortConfig: ConfigWithExtends[] = [
  {
    files: ['.vscode/settings.json'],
    name: namer('json/vscode/settings'),
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        {
          order: { type: 'asc' },
          pathPattern: String.raw`(eslint\.(probe|validate))|(npm\.exclude)`,
        },
      ],
      'jsonc/sort-keys': ['warn', { order: { type: 'asc' }, pathPattern: '^' }],
    },
  },

  {
    files: ['.vscode/extensions.json'],
    name: namer('json/vscode/extensions'),
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^recommendations$' },
      ],
    },
  },

  {
    files: ['.vscode/launch.json', '.vscode/tasks.json'],
    name: namer('json/vscode/launch-tasks'),
    rules: {
      'jsonc/sort-keys': [
        'warn',
        { order: ['version', { order: { type: 'asc' } }], pathPattern: '^$' },
        {
          order: ['label', 'detail', 'command', 'args', { order: { type: 'asc' } }],
          pathPattern: String.raw`^tasks\[\d+\]`,
        },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },
]
