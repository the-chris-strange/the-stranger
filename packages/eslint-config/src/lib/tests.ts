import {
  type ConfigWithExtends,
  type InfiniteConfigArray,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import vitestPlugin from '@vitest/eslint-plugin'
import cypressPlugin from 'eslint-plugin-cypress'
import jestPlugin from 'eslint-plugin-jest'
import playwrightPlugin from 'eslint-plugin-playwright'
import unicornPlugin from 'eslint-plugin-unicorn'

import type { ConfigOptions } from './options.js'
import type { Rules } from './rulesets/rules.js'

import { namer } from './namer.js'
import { playwrightRules } from './rulesets/playwright.js'
import { jestTestFileRules, vitestTestFileRules } from './rulesets/tests.js'
import { typeCheckedTestFileRules } from './rulesets/type-checked.js'
import { typescriptTestFileRules } from './rulesets/typescript.js'
import { unicornTestFileRules } from './rulesets/unicorn.js'

const cypressConfigs = getPluginConfigs(cypressPlugin)
const jestConfigs = getPluginConfigs(jestPlugin)
const playwrightConfigs = getPluginConfigs(playwrightPlugin)
const vitestConfigs = getPluginConfigs(vitestPlugin)

export function configureTests({ source, tests }: ConfigOptions) {
  const { disallowedWords = ['should'], e2eTestRunner, unitTestRunner } = tests ?? {}
  const configs: ConfigWithExtends[] = []

  if (!(e2eTestRunner || unitTestRunner)) {
    return configs
  }

  const baseConfig = {
    extends: [] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.test),
    name: namer('tests/base'),
    plugins: {} as Exclude<ConfigWithExtends['plugins'], undefined>,
    rules: {} as Rules,
  } satisfies ConfigWithExtends

  if (unitTestRunner === 'vitest') {
    baseConfig.extends.push(vitestConfigs['recommended'])
    Object.assign(baseConfig.rules, vitestTestFileRules, {
      'vitest/valid-title': ['warn', { disallowedWords }],
    })
  } else if (unitTestRunner === 'jest') {
    baseConfig.extends.push(jestConfigs['flat/recommended'], jestConfigs['flat/style'])
    Object.assign(baseConfig.rules, jestTestFileRules, {
      'jest/valid-title': ['error', { disallowedWords }],
    })
  }

  if (unitTestRunner) {
    if (source.unicorn) {
      baseConfig.plugins = { ...baseConfig.plugins, unicorn: unicornPlugin }
      Object.assign(baseConfig.rules, unicornTestFileRules)
    }

    if (source.ts.typescript) {
      Object.assign(baseConfig.rules, typescriptTestFileRules)
    }

    if (source.ts.typeChecked) {
      Object.assign(baseConfig.rules, typeCheckedTestFileRules)
    }
  }

  configs.push(baseConfig)

  if (e2eTestRunner === 'playwright') {
    configs.push({
      extends: [playwrightConfigs['flat/recommended']],
      files: ['e2e/**/*.{test,spec}.{ts,js}'],
      name: namer('tests/e2e/playwright'),
      rules: {
        ...playwrightRules,
        'playwright/valid-title': ['error', { disallowedWords }],
      },
      settings: {
        playwright: {
          globalAliases: {
            test: ['it'],
          },
        },
      },
    })
  } else if (e2eTestRunner === 'cypress') {
    configs.push({
      extends: [cypressConfigs.recommended],
      files: getFilePatterns(FilePatterns.cypress),
      name: namer('tests/e2e/cypress'),
    })
  }

  return configs
}

function getPluginConfigs<T extends { configs: object }>(plugin: T): T['configs'] {
  const module = plugin as T & { default?: T }

  if (module.configs) {
    return module.configs
  }

  if (module.default?.configs) {
    return module.default.configs
  }

  throw new TypeError('Unable to resolve ESLint plugin configs')
}
