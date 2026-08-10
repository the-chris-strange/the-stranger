import { type ConfigWithExtends, namer } from '@the-stranger/eslint-utils'

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
