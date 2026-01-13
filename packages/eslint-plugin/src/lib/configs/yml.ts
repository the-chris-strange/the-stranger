import yml from 'eslint-plugin-yml'

import type { Linter } from 'eslint'

import { namer } from '../namer.js'

const topLevelKeyOrder = [
  'name',
  'on',
  'permissions',
  'env',
  'defaults',
  'concurrency',
  'jobs',
]

const jobKeyOrder = [
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
]

const stepKeyOrder = ['id', 'name', 'if', 'run', 'uses', 'with', 'env']

const topLevelAscKeys = ['on', 'permissions', 'defaults'].join('|')

export default [
  yml.configs['flat/standard'],

  {
    files: ['cspell.config.yaml', '**/cspell.config.yaml'],
    name: namer('cspell-config'),
    rules: {
      'yml/sort-keys': [
        'error',
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
        'error',
        {
          order: { type: 'asc' },
          pathPattern: 'dictionaries|import|ignorePaths|ignoreWords|words$',
        },
      ],
    },
  },

  {
    files: ['.github/workflows/*.yml'],
    name: namer('github-actions'),
    rules: {
      'yml/no-empty-mapping-values': 'off',
      'yml/sort-keys': [
        'error',
        {
          order: [topLevelKeyOrder, { order: { type: 'asc' } }],
          pathPattern: '^$',
        },
        {
          order: { type: 'asc' },
          pathPattern: `^${topLevelAscKeys}`,
        },
        {
          order: [stepKeyOrder, { order: { type: 'asc' } }],
          pathPattern: String.raw`^jobs\..+steps`,
        },
        {
          order: [jobKeyOrder, { order: { type: 'asc' } }],
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

  {
    files: ['.markdownlint-cli2.yaml'],
    name: namer('markdownlint-config'),
    rules: {
      'yml/sort-keys': [
        'error',
        { order: ['ignores', { order: { type: 'asc' } }], pathPattern: '^$' },
        { order: { type: 'asc' }, pathPattern: '^configs' },
      ],
      'yml/sort-sequence-values': [
        'error',
        { order: { type: 'asc' }, pathPattern: '^ignores' },
      ],
    },
  },

  {
    files: ['.yarnrc.yml'],
    name: namer('yarnrc'),
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
] as Linter.Config[]
