import jest from 'eslint-plugin-jest'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

export default defineConfig(
  jest.configs['flat/recommended'],
  jest.configs['flat/style'],

  {
    name: namer('jest'),
    files: getFilePatterns(FilePatterns.test),
    rules: {
      'jest/consistent-test-it': ['error', { fn: 'it' }],
      'jest/no-confusing-set-timeout': 'error',
      'jest/prefer-each': 'warn',
      'jest/prefer-equality-matcher': 'error',
      'jest/prefer-expect-resolves': 'warn',
      'jest/prefer-hooks-in-order': 'error',
      'jest/prefer-hooks-on-top': 'warn',
      'jest/prefer-importing-jest-globals': 'error',
      'jest/prefer-jest-mocked': 'warn',
      'jest/prefer-lowercase-title': 'warn',
      'jest/prefer-mock-promise-shorthand': 'warn',
      'jest/prefer-spy-on': 'warn',
      'jest/prefer-strict-equal': 'warn',
      'jest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
)
