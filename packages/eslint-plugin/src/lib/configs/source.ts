import nxPlugin from '@nx/eslint-plugin'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import nPlugin from 'eslint-plugin-n'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import promisePlugin from 'eslint-plugin-promise'
import rePlugin from 'eslint-plugin-regexp'
import unicornPlugin from 'eslint-plugin-unicorn'
import tseslintPlugin from 'typescript-eslint'

import type { ESLint } from 'eslint'

import type { ConfigOptions } from '../configure.js'
import type { ConfigWithExtends, InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'
import { setSeverity } from '../set-severity.js'
import { configureJs } from './javascript.js'
import { moduleBoundaries } from './nx.js'
import { configureReact } from './react.js'
import { baseRules } from './rulesets/base.js'
import { configureTs } from './typescript.js'

export function configureSource({ nx, source }: ConfigOptions) {
  const configs: ConfigWithExtends[] = []

  if (
    Object.values(source).every(
      e =>
        e === false ||
        (typeof e === 'object' && !Object.values(e as object).includes(true)),
    )
  ) {
    return configs
  }

  if (nx === true) {
    configs.push(
      { plugins: { '@nx': nxPlugin as unknown as ESLint.Plugin } },

      moduleBoundaries({
        allow: ['eslint.config.*'],
        depConstraints: [
          {
            onlyDependOnLibsWithTags: ['npm:public'],
            sourceTag: 'npm:public',
          },
        ],
      }),
    )
  } else if (Array.isArray(nx)) {
    configs.push(...nx)
  }

  const baseConfig = {
    extends: [tseslintPlugin.configs['recommended']] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.source),
    name: namer('source/base'),
    plugins: {} as Exclude<ConfigWithExtends['plugins'], undefined>,
    settings: undefined as ConfigWithExtends['settings'],
  } satisfies ConfigWithExtends

  if (source.sort) {
    baseConfig.extends.push(
      setSeverity(perfectionistPlugin.configs['recommended-natural'], 'warn'),
    )
  }

  if (source.unicorn) {
    baseConfig.extends.push(unicornPlugin.configs['unopinionated'])
  }

  if (source.jsdoc) {
    baseConfig.plugins['jsdoc'] = jsdocPlugin
    baseConfig.extends.push(jsdocPlugin.configs['flat/recommended'])
    baseConfig.settings = {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
        },
      },
    }
  } else {
    delete baseConfig.settings
  }

  if (source.node) {
    baseConfig.plugins['n'] = nPlugin
  }

  if (source.regexp) {
    baseConfig.extends.push(rePlugin.configs['flat/recommended'])
  }

  if (source.promise) {
    baseConfig.extends.push(promisePlugin.configs['flat/recommended'])
  }

  configs.push(
    baseConfig,

    ...configureJs(source),
    ...configureTs(source),
    ...configureReact(source),

    {
      name: namer('source/rules'),
      rules: baseRules,
    },

    {
      files: getFilePatterns(FilePatterns.cjs),
      name: namer('source/cjs'),
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
  )

  return configs
}
