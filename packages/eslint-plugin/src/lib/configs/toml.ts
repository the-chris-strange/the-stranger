import toml from 'eslint-plugin-toml'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { getFilePatterns } from '../patterns'

export default defineConfig(
  toml.configs['flat/recommended'],

  {
    name: namer('toml'),
    files: getFilePatterns('toml'),
    rules: {
      'toml/array-bracket-newline': ['warn', 'consistent'],
      'toml/array-bracket-spacing': [
        'warn',
        'always',
        {
          arraysInArrays: false,
          objectsInArrays: false,
          singleValue: true,
        },
      ],
      'toml/array-element-newline': ['warn', 'consistent'],
      'toml/comma-style': 'warn',
      'toml/indent': ['warn', 2],
      'toml/inline-table-curly-spacing': 'warn',
      'toml/key-spacing': [
        'warn',
        { afterEqual: true, beforeEqual: true, mode: 'strict' },
      ],
      'toml/no-space-dots': 'warn',
      'toml/no-unreadable-number-separator': 'warn',
      'toml/precision-of-fractional-seconds': ['warn', { max: 3 }],
      'toml/precision-of-integer': ['warn', { maxBit: 64 }],
      'toml/spaced-comment': 'warn',
      'toml/table-bracket-spacing': 'warn',
    },
  },
)
