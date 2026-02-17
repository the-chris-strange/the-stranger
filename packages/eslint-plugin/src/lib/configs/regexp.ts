import rePlugin from 'eslint-plugin-regexp'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const re = [
  {
    extends: [rePlugin.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.source),
    name: namer('re'),
  },
] satisfies InfiniteConfigArray

export default re
