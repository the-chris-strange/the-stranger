import eslintReactPlugin from '@eslint-react/eslint-plugin'
import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import astroPlugin from 'eslint-plugin-astro'
import jsxAllyPlugin from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'

import type { ESLint } from 'eslint'

import type { ConfigOptions } from './configure.js'

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
        jsxAllyPlugin.flatConfigs['recommended'],
        reactHooks.configs.flat['recommended'],
        eslintReactPlugin.configs['strict'],
      ],
      files: getFilePatterns(FilePatterns.react),
      name: namer('react/base'),
      plugins: {
        '@eslint-react': eslintReactPlugin,
        'jsx-a11y': jsxAllyPlugin,
        'react-hooks': reactHooks as ESLint.Plugin,
      },
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

  configs.push(
    {
      files: getFilePatterns(FilePatterns.react),
      name: namer('react/file-casing'),
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
    },

    {
      name: namer('react/rules'),
      rules: reactRules,
    },
  )

  return configs
}
