import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

// tags used by docusaurus to generate docs from jsdoc comments
export const DOCUSAURUS_TAGS = ['document']

export default defineConfig(
  {
    name: namer('jsdoc'),
    plugins: { jsdoc },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
        },
      },
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': [
        'error',
        {
          checkGetters: false,
        },
      ],
    },
  },

  {
    name: namer('jsdoc/typescript'),
    extends: [jsdoc.configs['flat/recommended-typescript']],
    files: getFilePatterns(FilePatterns.ts),
  },

  {
    name: namer('jsdoc/javascript'),
    extends: [jsdoc.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.js),
  },

  {
    name: namer('jsdoc/docusaurus'),
    files: getFilePatterns(FilePatterns.source),
    rules: {
      'jsdoc/check-tag-names': ['warn', { definedTags: DOCUSAURUS_TAGS }],
    },
  },
)
