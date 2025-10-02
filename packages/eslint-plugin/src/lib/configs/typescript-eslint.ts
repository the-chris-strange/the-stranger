import { type Linter } from 'eslint'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'
import { moduleExists } from '../require-utils'

const config: Linter.Config[] = [
  {
    name: namer('unnecessary ts rules'),
    files: getFilePatterns(FilePatterns.source),
    rules: {
      // I do what I want ¯\_(ツ)_/¯
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  {
    name: namer('disable no-non-null in tests'),
    files: getFilePatterns(FilePatterns.test),
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
]

if (!moduleExists('@nx/eslint-plugin')) {
  config.unshift(...tseslint.configs.recommended)
}

export default defineConfig(config)
