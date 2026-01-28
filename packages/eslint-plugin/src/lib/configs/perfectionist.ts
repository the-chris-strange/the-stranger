import perfectionist from 'eslint-plugin-perfectionist'

import type { Linter } from 'eslint'

import { namer, objectNamer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'
import { setRuleLevel } from '../severity.js'

const configNatural = setRuleLevel('warn', perfectionist.configs['recommended-natural'])

export default [
  objectNamer(configNatural, 'perfectionist-recommended-natural'),

  {
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
      'perfectionist/sort-exports': [
        'warn',
        {
          type: 'natural',
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
          type: 'natural',
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
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          type: 'natural',
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
    name: namer('disable sort for configuration files'),
    rules: {
      'perfectionist/sort-objects': 'off',
    },
  },
] as Linter.Config[]
