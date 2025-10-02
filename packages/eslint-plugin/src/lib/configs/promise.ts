import promise from 'eslint-plugin-promise'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

export default defineConfig(
  promise.configs['flat/recommended'],

  {
    name: namer('promise'),
    files: getFilePatterns(FilePatterns.source),
    rules: {
      'promise/no-multiple-resolved': 'warn',
      'promise/prefer-await-to-callbacks': 'warn',
      'promise/prefer-await-to-then': 'warn',
      'promise/spec-only': 'error',
    },
  },
)
