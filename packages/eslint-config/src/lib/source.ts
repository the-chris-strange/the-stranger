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

import type { ConfigOptions } from './options.js'
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
    plugins,
    settings: undefined as ConfigWithExtends['settings'],
  } satisfies ConfigWithExtends
  const baseRules = {} satisfies Rules

  if (source.node) {
    plugins['n'] = nPlugin
    Object.assign(baseRules, nRules)
  }

  if (source.sort) {
    baseConfig.extends.push(
      setSeverity(perfectionistPlugin.configs['recommended-natural'], 'warn'),
    )
    Object.assign(baseRules, sortRules)
  }

  if (source.unicorn) {
    Object.assign(baseRules, unicornRules)
    baseConfig.extends.push(unicornPlugin.configs['unopinionated'])
  }

  if (source.jsdoc) {
    Object.assign(baseRules, jsdocRules)
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
    Object.assign(baseRules, promiseRules)
    baseConfig.extends.push(promisePlugin.configs['flat/recommended'])
  }

  if (Object.keys(baseConfig.settings ?? {}).length === 0) {
    delete baseConfig.settings
  }

  const configs: ConfigWithExtends[] = [
    baseConfig,

    ...configureNx(nx),
    ...configureJs(source),
    ...configureTs(source),
    ...configureReact(source),

    {
      files: getFilePatterns(FilePatterns.source),
      name: namer('source/rules'),
      rules: baseRules,
    },

    createCJSConfig(source),
  ]

  if (source.agentSkills) {
    const agentSkillsConfig: ConfigWithExtends = {
      files: ['**/skills/**/*.{js,mjs,cjs,ts,mts,cts}'],
      name: namer('source/rules/skills'),
      rules: agentSkillsRules,
    }

    if (!source.node) {
      agentSkillsConfig.plugins = { n: nPlugin }
    }

    configs.push(agentSkillsConfig)
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
