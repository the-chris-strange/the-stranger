import yml from 'eslint-plugin-yml'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'

export default defineConfig(
  yml.configs['flat/standard'],

  {
    name: namer('cspell-config'),
    files: ['**/cspell.config.yaml'],
    rules: {
      'yml/sort-keys': [
        'error',
        {
          pathPattern: '^$',
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
        },
        {
          pathPattern: 'languageSettings$',
          order: ['languageId', 'dictionaries', { order: { type: 'asc' } }],
        },
      ],
      'yml/sort-sequence-values': [
        'error',
        {
          pathPattern: 'dictionaries|import|ignorePaths|ignoreWords|words$',
          order: { type: 'asc' },
        },
      ],
    },
  },

  {
    name: namer('github-actions'),
    files: ['.github/workflows/*.yml'],
    rules: {
      'yml/sort-keys': [
        'error',
        {
          pathPattern: '^$',
          order: ['name', 'on', 'permissions', 'jobs'],
        },
        {
          pathPattern: 'jobs\/\w+$',
          order: ['name', 'runs-on', 'steps'],
        },
        {
          pathPattern: 'jobs\/\w+\/steps$',
          order: ['name', 'if', { order: { type: 'asc' } }],
        },
      ],
    },
  },
)
