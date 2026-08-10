import { type ConfigWithExtends, namer } from '@the-stranger/eslint-utils'

export const markdownlintYamlSortConfig = [
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
] satisfies ConfigWithExtends[]
