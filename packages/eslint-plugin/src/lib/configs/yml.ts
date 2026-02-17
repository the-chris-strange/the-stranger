import ymlPlugin from 'eslint-plugin-yml'

import type { InfiniteConfigArray } from '../extend-config.js'

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

export const cspellConfig = [
  {
    files: ['cspell.config.yaml', '**/cspell.config.yaml'],
    name: namer('sort/cspell-config'),
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
] satisfies InfiniteConfigArray

export const githubActions = [
  {
    files: ['.github/workflows/*.yml'],
    name: namer('sort/github-actions'),
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
] satisfies InfiniteConfigArray

export const markdownlintConfig = [
  {
    files: ['.markdownlint-cli2.yaml'],
    name: namer('sort/markdownlint-config'),
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
] satisfies InfiniteConfigArray

export const yarnrc = [
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
] satisfies InfiniteConfigArray

export const yml = [
  {
    extends: [ymlPlugin.configs['flat/standard']],
    files: ['*.yml', '*.yaml'],
    name: namer('yml/standard'),
  },

  ...cspellConfig,
  ...githubActions,
  ...markdownlintConfig,
  ...yarnrc,
] satisfies InfiniteConfigArray

export default yml
