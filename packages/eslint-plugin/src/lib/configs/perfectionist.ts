import perfectionistPlugin from 'eslint-plugin-perfectionist'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'
import { setRuleLevel } from '../severity.js'

const configNatural = setRuleLevel(
  'warn',
  perfectionistPlugin.configs['recommended-natural'],
)

export const perfectionist = [
  {
    extends: [configNatural],
    files: getFilePatterns(FilePatterns.source),
    name: namer('perfectionist'),
    rules: {
      'perfectionist/sort-classes': [
        'warn',
        {
          groups: [
            'constructor',
            'index-signature',
            'static-block',
            'accessor-property',
            ['get-method', 'set-method'],
            'method',
            'override-method',
            'static-method',
            'protected-method',
            'private-method',
            'protected-accessor-property',
            'private-accessor-property',
            ['private-get-method', 'private-set-method'],
          ],
        },
      ],
      'perfectionist/sort-enums': [
        'warn',
        {
          forceNumericSort: true,
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: [
            ['side-effect', 'side-effect-style'],
            'builtin',
            'external',
            'type',
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          newlinesBetween: 'always',
        },
      ],
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-modules': [
        'warn',
        {
          groups: [
            'unknown',
            'export-class',
            'export-function',
            'export-enum',
            ['export-interface', 'export-type'],
            'class',
            'function',
            'enum',
            ['interface', 'type'],
            [
              'export-default-class',
              'export-default-function',
              'export-default-enum',
              'export-default-type',
              'export-default-interface',
            ],
          ],
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          groupKind: 'values-first',
        },
      ],
      'perfectionist/sort-union-types': [
        'warn',
        {
          groups: [
            'conditional',
            'function',
            'operator',
            'literal',
            'keyword',
            'named',
            'import',
            'tuple',
            'object',
            ['intersection', 'union'],
            'nullish',
            'unknown',
          ],
          ignoreCase: false,
        },
      ],
    },
  },

  {
    files: ['eslint.config.*', 'prettier.config.*', 'yarn.config.cjs'],
    name: namer('disable object sort for configuration files'),
    rules: {
      'perfectionist/sort-objects': 'off',
    },
  },
] satisfies InfiniteConfigArray

export default perfectionist
