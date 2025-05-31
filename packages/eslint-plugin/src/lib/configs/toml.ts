import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { ConfigBuilder } from '../config-builder'
import { getFilePatterns } from '../patterns'

export const tomlConfig: ConfigBuilder = async () => {
  try {
    const toml = await import('eslint-plugin-toml')
    await import('toml-eslint-parser')
    return [
      toml.configs['flat/recommended'] as FlatConfig.Config,

      {
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
    ]
  } catch {
    return
  }
}
