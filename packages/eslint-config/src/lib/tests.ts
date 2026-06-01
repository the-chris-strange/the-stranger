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

import type { ConfigOptions } from './configure.js'
import type { Rules } from './rulesets/rules.js'

import { namer } from './namer.js'
import { playwrightRules } from './rulesets/playwright.js'
import { jestTestFileRules, vitestTestFileRules } from './rulesets/tests.js'
import { typeCheckedTestFileRules } from './rulesets/type-checked.js'
import { typescriptTestFileRules } from './rulesets/typescript.js'
import { unicornTestFileRules } from './rulesets/unicorn.js'

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
  } satisfies ConfigWithExtends
  const unitTestRules = {} satisfies Rules

  if (unitTestRunner === 'vitest') {
    baseConfig.extends.push(vitestPlugin.configs['recommended'])
    Object.assign(unitTestRules, vitestTestFileRules, {
      'vitest/valid-title': ['warn', { disallowedWords }],
    })
  } else if (unitTestRunner === 'jest') {
    baseConfig.extends.push(
      jestPlugin.configs['flat/recommended'],
      jestPlugin.configs['flat/style'],
    )
    Object.assign(unitTestRules, jestTestFileRules, {
      'jest/valid-title': ['error', { disallowedWords }],
    })
  }

  configs.push(baseConfig)

  if (unitTestRunner) {
    if (source.unicorn) {
      Object.assign(unitTestRules, unicornTestFileRules)
    }

    if (source.ts.typescript) {
      Object.assign(unitTestRules, typescriptTestFileRules)
    }

    if (source.ts.typeChecked) {
      Object.assign(unitTestRules, typeCheckedTestFileRules)
    }

    configs.push({
      files: getFilePatterns(FilePatterns.test),
      name: namer('tests/rules'),
      rules: unitTestRules,
    })
  }

  if (e2eTestRunner === 'playwright') {
    configs.push({
      extends: [playwrightPlugin.configs['flat/recommended']],
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
      extends: [cypressPlugin.configs.recommended],
      files: getFilePatterns(FilePatterns.cypress),
      name: namer('tests/e2e/cypress'),
    })
  }

  return configs
}
