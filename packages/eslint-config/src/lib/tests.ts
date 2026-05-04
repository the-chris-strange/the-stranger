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

import { namer } from './namer.js'
import { playwrightRules } from './rulesets/playwright.js'
import { testFileRules } from './rulesets/tests.js'

export function configureTests({ tests }: ConfigOptions) {
  const { disallowedWords = ['should'], e2eTestRunner, unitTestRunner } = tests ?? {}
  const configs: ConfigWithExtends[] = []

  if (!(e2eTestRunner || unitTestRunner)) {
    return configs
  }

  const unitTestConfig = {
    extends: [] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.test),
    name: namer('tests/base'),
  } satisfies ConfigWithExtends

  if (unitTestRunner === 'vitest') {
    unitTestConfig.extends.push(vitestPlugin.configs['recommended'])
  } else if (unitTestRunner === 'jest') {
    unitTestConfig.extends.push(
      jestPlugin.configs['flat/recommended'],
      jestPlugin.configs['flat/style'],
    )
  }

  configs.push(unitTestConfig)

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

  configs.push({
    files: getFilePatterns(FilePatterns.test),
    name: namer('tests/rules'),
    rules: {
      ...testFileRules,
      'jest/valid-title': ['warn', { disallowedWords }],
      'vitest/valid-title': ['warn', { disallowedWords }],
    },
  })

  return configs
}
