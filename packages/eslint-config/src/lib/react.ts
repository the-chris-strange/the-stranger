import eslintReactPlugin from '@eslint-react/eslint-plugin'
import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import astroPlugin from 'eslint-plugin-astro'
import jsxAllyPlugin from 'eslint-plugin-jsx-a11y-x'
import reactHooks from 'eslint-plugin-react-hooks'
import unicornPlugin from 'eslint-plugin-unicorn'

import type { ConfigOptions } from './options.js'

import { languageOptions } from './configs/language-options.js'
import { namer } from './namer.js'
import { reactRules } from './rulesets/react.js'

export function configureReact({ react }: ConfigOptions['source']) {
  if (!Object.values(react).includes(true)) {
    return []
  }

  const configs: ConfigWithExtends[] = [
    {
      extends: [
        jsxAllyPlugin.configs['recommended'],
        reactHooks.configs.flat['recommended'],
        eslintReactPlugin.configs['strict'],
      ],
      files: getFilePatterns(FilePatterns.react),
      name: namer('react/base'),
      rules: reactRules,
    },
  ]

  if (react.typescript) {
    configs.push({
      extends: [
        eslintReactPlugin.configs[
          react.typeChecked ? 'strict-type-checked' : 'strict-typescript'
        ],
      ],
      files: getFilePatterns(FilePatterns.reactTs),
      languageOptions,
      name: namer('react/typescript'),
    })
  }

  if (react.astro) {
    configs.push({
      extends: [
        astroPlugin.configs['flat/recommended'],
        astroPlugin.configs['flat/jsx-a11y-strict'],
      ],
      files: getFilePatterns(FilePatterns.astro, FilePatterns.astroScript),
      name: namer('react/astro'),
    })
  }

  configs.push({
    files: getFilePatterns(FilePatterns.react),
    name: namer('react/file-casing'),
    plugins: { unicorn: unicornPlugin },
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  })

  return configs
}
