import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

// tags used by docusaurus to generate docs from jsdoc comments
export const DOCUSAURUS_TAGS = ['document']

export default defineConfig(
  {
    name: namer('jsdoc'),
    plugins: { jsdoc },
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
    extends: [jsdoc.configs['flat/recommended-typescript']],
    files: getFilePatterns(FilePatterns.ts),
    name: namer('jsdoc/typescript'),
  },

  {
    extends: [jsdoc.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.js),
    name: namer('jsdoc/javascript'),
  },

  {
    files: getFilePatterns(FilePatterns.source),
    name: namer('jsdoc/docusaurus'),
    rules: {
      'jsdoc/check-tag-names': ['warn', { definedTags: DOCUSAURUS_TAGS }],
    },
  },
)
