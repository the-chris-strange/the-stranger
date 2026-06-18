import { type ConfigOptions } from '@the-stranger/eslint-config'

import { type EslintConfigSchema } from './schema'

export function normalizeOptions(options: EslintConfigSchema): NormalizedOptions {
  const defaultOptions = {
    json: {
      sort: {
        nx: true,
        tsconfig: true,
        vscode: true,
      },
    },
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
    yaml: {
      sort: {
        cspellConfig: true,
        dependabotConfig: true,
        githubActions: true,
        markdownlintConfig: true,
        yarnrc: true,
      },
    },
  } satisfies ConfigOptions

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
