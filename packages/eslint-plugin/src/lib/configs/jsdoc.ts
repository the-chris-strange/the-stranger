import jsdocPlugin from 'eslint-plugin-jsdoc'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const jsdoc = [
  {
    files: getFilePatterns(FilePatterns.source),
    name: namer('jsdoc'),
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': [
        'error',
        {
          checkGetters: false,
        },
      ],
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
        },
      },
    },
  },

  {
    extends: [jsdocPlugin.configs['flat/recommended-typescript']],
    files: getFilePatterns(FilePatterns.ts),
    name: namer('jsdoc/typescript'),
  },

  {
    extends: [jsdocPlugin.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.js),
    name: namer('jsdoc/javascript'),
  },
] satisfies InfiniteConfigArray

export default jsdoc
