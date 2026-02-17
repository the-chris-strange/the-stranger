import eslintReact from '@eslint-react/eslint-plugin'
import jsxAlly from 'eslint-plugin-jsx-a11y'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'

import type { ESLint } from 'eslint'

import type { InfiniteConfigArray } from '../extend-config.js'

import { FilePatterns, getFilePatterns } from '../patterns.js'

export const react = [
  {
    extends: [
      jsxAlly.flatConfigs['recommended'],
      reactHooks.configs.flat['recommended'],
      reactCompiler.configs['recommended'],
      eslintReact.configs['strict'],
    ],
    files: getFilePatterns(FilePatterns.react),
    plugins: {
      '@eslint-react': eslintReact,
      'jsx-a11y': jsxAlly,
      'react-compiler': reactCompiler,
      'react-hooks': reactHooks as ESLint.Plugin,
    },
    rules: {
      '@eslint-react/jsx-shorthand-boolean': 'warn',
      '@eslint-react/jsx-shorthand-fragment': 'warn',
      '@eslint-react/naming-convention/component-name': 'warn',
      '@eslint-react/naming-convention/context-name': 'warn',
      '@eslint-react/no-duplicate-key': 'error',
      '@eslint-react/no-missing-component-display-name': 'warn',
      '@eslint-react/no-missing-context-display-name': 'warn',
      '@eslint-react/prefer-read-only-props': 'error',
    },
  },
] satisfies InfiniteConfigArray

export default react
