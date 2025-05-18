import jsdoc from 'eslint-plugin-jsdoc'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

// tags used by docusaurus to generate docs from jsdoc comments
export const DOCUSAURUS_TAGS = ['document']

/**
 * Default configuration for [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc#readme).
 */
export default [
  { plugins: { jsdoc } },

  {
    ...jsdoc.configs['flat/recommended-typescript'],
    files: getFilePatterns(FilePatterns.ts),
  },

  {
    ...jsdoc.configs['flat/recommended'],
    files: getFilePatterns(FilePatterns.js),
  },

  {
    files: getFilePatterns(FilePatterns.source),
    rules: {
      'jsdoc/check-tag-names': ['warn', { definedTags: DOCUSAURUS_TAGS }],
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': [
        'error',
        {
          checkGetters: false,
        },
      ],
    },
  },
] satisfies FlatConfig.ConfigArray
