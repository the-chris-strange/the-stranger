import promise from 'eslint-plugin-promise'

import type { Linter } from 'eslint'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export default [
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
] as Linter.Config[]
