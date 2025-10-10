import promise from 'eslint-plugin-promise'
import { defineConfig } from 'eslint/config'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export default defineConfig(
  promise.configs['flat/recommended'],

  {
    files: getFilePatterns(FilePatterns.source),
    name: namer('promise'),
    rules: {
      'promise/no-multiple-resolved': 'warn',
      'promise/prefer-await-to-callbacks': 'warn',
      'promise/prefer-await-to-then': 'warn',
      'promise/spec-only': 'error',
    },
  },
)
