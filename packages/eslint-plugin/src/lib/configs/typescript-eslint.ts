import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { ConfigBuilder } from '../config'
import { FilePatterns, getFilePatterns } from '../patterns'

export const typescriptEslintConfig: ConfigBuilder = async () => {
  const config: (FlatConfig.Config | FlatConfig.ConfigArray)[] = [
    {
      files: getFilePatterns(FilePatterns.source),
      rules: {
        // I do what I want ¯\_(ツ)_/¯
        '@typescript-eslint/no-explicit-any': 'off',
        // unnecessary; ts language server covers this in vscode
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },

    {
      files: getFilePatterns(FilePatterns.test),
      rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
    },
  ]

  let nx: boolean
  try {
    await import('@nx/eslint-plugin')
    nx = true
  } catch {
    nx = false
  }

  // if @nx/eslint-plugin isn't present, add the recommended config from typescript-eslint to correctly configure the parser
  if (!nx) {
    const tseslint = await import('typescript-eslint')
    config.unshift(tseslint.configs.recommended)
  }

  return config
}
