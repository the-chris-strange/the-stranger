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
import type { Rules } from './rulesets/rules.js'

import { configureJs } from './javascript.js'
import { namer } from './namer.js'
import { configureNx } from './nx.js'
import { configureReact } from './react.js'
import { agentSkillsRules } from './rulesets/agent-skills.js'
import { jsdocRules } from './rulesets/jsdoc.js'
import { nRules } from './rulesets/n.js'
import { promiseRules } from './rulesets/promise.js'
import { sortRules } from './rulesets/sort.js'
import { unicornRules } from './rulesets/unicorn.js'
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

  const plugins: Exclude<ConfigWithExtends['plugins'], undefined> = {}
  const baseConfig = {
    extends: [tseslintPlugin.configs['recommended']] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.source),
    name: namer('source/base'),
    rules: {} as Rules,
    settings: undefined as ConfigWithExtends['settings'],
  } satisfies ConfigWithExtends

  if (source.node) {
    plugins['n'] = nPlugin
    Object.assign(baseConfig.rules, nRules)
  }

  if (source.sort) {
    baseConfig.extends.push(
      setSeverity(perfectionistPlugin.configs['recommended-natural'], 'warn'),
    )
    Object.assign(baseConfig.rules, sortRules)
  }

  if (source.unicorn) {
    plugins['unicorn'] = unicornPlugin
    Object.assign(baseConfig.rules, unicornRules)
    baseConfig.extends.push(unicornPlugin.configs['unopinionated'])
  }

  if (source.jsdoc) {
    plugins['jsdoc'] = jsdocPlugin
    Object.assign(baseConfig.rules, jsdocRules)
    baseConfig.extends.push(jsdocPlugin.configs['flat/recommended'])
    baseConfig.settings ??= {}
    baseConfig.settings['jsdoc'] = {
      tagNamePreference: {
        augments: 'extends',
      },
    }
  }

  if (source.regexp) {
    baseConfig.extends.push(rePlugin.configs['flat/recommended'])
  }

  if (source.promise) {
    Object.assign(baseConfig.rules, promiseRules)
    baseConfig.extends.push(promisePlugin.configs['flat/recommended'])
  }

  if (Object.keys(baseConfig.settings ?? {}).length === 0) {
    delete baseConfig.settings
  }

  const configs: ConfigWithExtends[] = [
    {
      name: namer('source/plugins'),
      plugins,
    },

    ...configureNx(nx),
    ...configureJs(source),

    baseConfig,

    ...configureTs(source),
    ...configureReact(source),

    createCJSConfig(source),
  ]

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

function createCJSConfig(source: ConfigOptions['source']): ConfigWithExtends {
  const rules: Rules = {}

  if (Object.values(source.ts).includes(true)) {
    rules['@typescript-eslint/no-require-imports'] = 'off'
  }

  if (source.unicorn) {
    rules['unicorn/prefer-module'] = 'off'
  }

  return {
    files: getFilePatterns(FilePatterns.cjs),
    name: namer('source/rules/cjs'),
    rules,
  }
}
