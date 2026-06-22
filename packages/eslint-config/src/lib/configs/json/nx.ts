import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { namer } from '../../namer.js'

const targetKeyOrder = [
  'cache',
  'dependsOn',
  'executor',
  'inputs',
  'outputs',
  'options',
  { order: { type: 'asc' } },
] as const

export const nxJsonSortConfig: ConfigWithExtends[] = [
  {
    files: ['nx.json'],
    name: namer('json/nx/nx.json'),
    rules: {
      'jsonc/sort-keys': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^plugins.+options' },
        { order: ['plugin', 'options'], pathPattern: '^plugins' },
        { order: targetKeyOrder, pathPattern: '^targetDefaults.+' },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },

  {
    files: ['executors.json', 'generators.json'],
    name: namer('json/nx/plugins'),
    rules: {
      'jsonc/sort-keys': ['warn', { order: { type: 'asc' }, pathPattern: '^' }],
    },
  },

  {
    files: ['project.json', '**/project.json'],
    name: namer('json/nx/project.json'),
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^tags' },
      ],
      'jsonc/sort-keys': [
        'warn',
        { order: targetKeyOrder, pathPattern: '^targets.+' },
        {
          order: [
            'name',
            '$schema',
            'projectType',
            'sourceRoot',
            'tags',
            'targets',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },
]
