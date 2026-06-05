import {
  type ConfigWithExtends,
  type InfiniteConfigArray,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import tseslintPlugin from 'typescript-eslint'

import type { ConfigOptions } from './options.js'

import { languageOptions } from './configs/language-options.js'
import { namer } from './namer.js'
import { typeCheckedRules } from './rulesets/type-checked.js'
import { typescriptRules } from './rulesets/typescript.js'

const jsdocConfigs = getJsdocConfigs(jsdocPlugin)

export function configureTs({
  jsdoc,
  ts,
}: ConfigOptions['source']): ConfigWithExtends[] {
  if (!Object.values(ts).includes(true)) {
    return []
  }

  const config = {
    extends: [] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.ts),
    languageOptions,
    name: namer('typescript/base'),
    rules: typescriptRules,
  } satisfies ConfigWithExtends

  if (ts.typeChecked) {
    config.extends.push(
      tseslintPlugin.configs[`${ts.strict ? 'strict' : 'recommended'}TypeCheckedOnly`],
    )
    Object.assign(config.rules, typeCheckedRules)
  }

  if (jsdoc) {
    config.extends.push(jsdocConfigs['flat/recommended-typescript'])
  }

  return [config]
}

function getJsdocConfigs(plugin: unknown): typeof jsdocPlugin.configs {
  if (isJsdocPlugin(plugin)) {
    return plugin.configs
  }

  if (isJsdocPluginModule(plugin) && isJsdocPlugin(plugin.default)) {
    return plugin.default.configs
  }

  throw new TypeError('Unable to resolve eslint-plugin-jsdoc configs')
}

function isJsdocPlugin(value: unknown): value is typeof jsdocPlugin {
  return isNonNullObject(value) && 'configs' in value && isNonNullObject(value.configs)
}

function isJsdocPluginModule(
  value: unknown,
): value is { default?: typeof jsdocPlugin } {
  return isNonNullObject(value) && 'default' in value
}

function isNonNullObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}
