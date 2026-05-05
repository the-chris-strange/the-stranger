import {
  type ConfigWithExtends,
  type InfiniteConfigArray,
  FilePatterns,
  getFilePatterns,
  setSeverity,
} from '@the-stranger/eslint-utils'
import prettierConfig from 'eslint-config-prettier'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import nPlugin from 'eslint-plugin-n'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import promisePlugin from 'eslint-plugin-promise'
import rePlugin from 'eslint-plugin-regexp'
import unicornPlugin from 'eslint-plugin-unicorn'
import tseslintPlugin from 'typescript-eslint'

import type { ConfigOptions } from './configure.js'

import { configureJs } from './javascript.js'
import { namer } from './namer.js'
import { configureNx } from './nx.js'
import { configureReact } from './react.js'
import { agentSkillsRules } from './rulesets/agent-skills.js'
import { baseRules } from './rulesets/base.js'
import { commonjsRules } from './rulesets/commonjs.js'
import { sortRules } from './rulesets/sort.js'
import { configureTs } from './typescript.js'

export function configureSource({ nx, source }: ConfigOptions): ConfigWithExtends[] {
  if (
    Object.values(source).every(
      e =>
        e === false ||
        (typeof e === 'object' && !Object.values(e as object).includes(true)),
    )
  ) {
    return []
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

  const configs: ConfigWithExtends[] = [
    ...configureNx(nx),
    ...configureJs(source),

    baseConfig,

    ...configureTs(source),
    ...configureReact(source),

    {
      name: namer('source/rules'),
      rules: baseRules,
    },

    {
      files: getFilePatterns(FilePatterns.cjs),
      name: namer('source/rules/cjs'),
      rules: commonjsRules,
    },
  ]

  if (source.sort) {
    configs.push({ name: namer('source/rules/sort'), rules: sortRules })
  }

  if (source.agentSkills) {
    configs.push({
      files: ['**/skills/**/*.{js,mjs,cjs,ts,mts,cts}'],
      name: namer('source/rules/skills'),
      rules: agentSkillsRules,
    })
  }

  configs.push(prettierConfig)

  return configs
}
