import promisePlugin from 'eslint-plugin-promise'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const promise = [
  {
    extends: [promisePlugin.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.source),
    name: namer('promise'),
    rules: {
      'promise/no-callback-in-promise': 'error',
      'promise/no-multiple-resolved': 'error',
      'promise/no-nesting': 'error',
      'promise/no-promise-in-callback': 'error',
      'promise/no-return-in-finally': 'error',
      'promise/prefer-await-to-callbacks': 'error',
      'promise/prefer-await-to-then': 'error',
      'promise/spec-only': 'error',
      'promise/valid-params': 'error',
    },
  },
] satisfies InfiniteConfigArray

export default promise
