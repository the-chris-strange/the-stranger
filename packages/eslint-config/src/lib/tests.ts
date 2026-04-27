import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
  type InfiniteConfigArray,
} from '@the-stranger/eslint-utils'
import vitestPlugin from '@vitest/eslint-plugin'
import cypressPlugin from 'eslint-plugin-cypress'
import jestPlugin from 'eslint-plugin-jest'
import playwrightPlugin from 'eslint-plugin-playwright'

import type { ConfigOptions } from './config-options.js'

import { namer } from './namer.js'

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
        'playwright/prefer-strict-equal': 'error',
        'playwright/prefer-to-be': 'error',
        'playwright/prefer-to-contain': 'error',
        'playwright/require-hook': 'error',
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
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      'jest/consistent-test-it': ['error', { fn: 'it' }],
      'jest/no-confusing-set-timeout': 'error',
      'jest/prefer-each': 'warn',
      'jest/prefer-equality-matcher': 'error',
      'jest/prefer-expect-resolves': 'warn',
      'jest/prefer-hooks-in-order': 'error',
      'jest/prefer-hooks-on-top': 'warn',
      'jest/prefer-importing-jest-globals': 'error',
      'jest/prefer-jest-mocked': 'warn',
      'jest/prefer-lowercase-title': 'warn',
      'jest/prefer-mock-promise-shorthand': 'warn',
      'jest/prefer-spy-on': 'warn',
      'jest/prefer-strict-equal': 'warn',
      'jest/valid-title': ['warn', { disallowedWords }],

      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': [
        'error',
        { checkArguments: false, checkArrowFunctionBody: false },
      ],

      'vitest/consistent-test-it': ['warn', { fn: 'it' }],
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/valid-title': ['warn', { disallowedWords }],
    },
  })

  return configs
}
