import type { Options } from '@the-stranger/eslint-config'

import type { EslintConfigSchema } from './schema'

export function normalizeOptions(options: EslintConfigSchema): NormalizedOptions {
  const defaultOptions = {
    nx: true,
    source: {
      agentSkills: true,
      js: {
        browser: false,
        node: true,
      },
      jsdoc: true,
      node: true,
      promise: true,
      react: {
        astro: false,
        typeChecked: false,
        typescript: false,
      },
      regexp: true,
      sort: true,
      ts: {
        strict: false,
        typeChecked: true,
        typescript: true,
      },
      unicorn: true,
    },
    tests: {
      disallowedWords: ['should'],
      unitTestRunner: 'vitest',
    },
  } satisfies Options

  const configureOptions = Object.assign({}, defaultOptions, options.configureOptions)

  const { additionalConfigs = [] } = options

  return {
    ...options,
    additionalConfigs,
    configureOptions,
  }
}

export type NormalizedOptions = EslintConfigSchema &
  Required<Pick<EslintConfigSchema, 'additionalConfigs' | 'configureOptions'>>
