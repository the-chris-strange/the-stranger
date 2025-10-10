import { type Linter } from 'eslint'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

const config: Linter.Config[] = [
  {
    files: getFilePatterns(FilePatterns.source),
    name: namer('unnecessary ts rules'),
    rules: {
      // I do what I want ¯\_(ツ)_/¯
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  {
    files: getFilePatterns(FilePatterns.test),
    name: namer('disable no-non-null in tests'),
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
]

try {
  await import('@nx/eslint-plugin')
} catch {
  config.unshift(...tseslint.configs.recommended)
}

export default defineConfig(config)
