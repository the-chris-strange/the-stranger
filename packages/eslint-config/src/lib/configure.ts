import { defineConfig, globalIgnores } from 'eslint/config'

import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { type Options, resolveOptions } from './config-options.js'
import { tomlConfig } from './configs/toml.js'
import { configureJson } from './json.js'
import { namer } from './namer.js'
import { configureSource } from './source.js'
import { configureTests } from './tests.js'
import { configureYaml } from './yaml.js'

export function configure(options?: Options) {
  const config = resolveOptions(options)
  const configs: ConfigWithExtends[] = [
    ...configureSource(config),
    ...configureTests(config),
    ...configureJson(config),
    ...configureYaml(config),
  ]

  if (config.toml) {
    configs.push(...tomlConfig)
  }

  return defineConfig(
    globalIgnores(
      [
        '.cache',
        '.github',
        '.nx',
        '.pnp.*',
        '.yarn',
        'coverage',
        'dist',
        'out-tsc',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'tmp',
      ],
      namer('global ignores'),
    ),

    { linterOptions: { reportUnusedDisableDirectives: 'error' } },

    ...configs,
  )
}
