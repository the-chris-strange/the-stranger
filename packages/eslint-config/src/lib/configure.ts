import { type Config, defineConfig, globalIgnores } from 'eslint/config'

import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { tomlConfig } from './configs/toml.js'
import { configureJson } from './json.js'
import { namer } from './namer.js'
import { type Options, resolveOptions } from './options.js'
import { configureSource } from './source.js'
import { configureTests } from './tests.js'
import { configureYaml } from './yaml.js'

export function configure(
  options?: Options,
  ...configs: ConfigWithExtends[]
): Config[] {
  const config = resolveOptions(options)
  const configArray: ConfigWithExtends[] = [
    ...configureSource(config),
    ...configureTests(config),
    ...configureJson(config),
    ...configureYaml(config),
  ]

  if (config.toml) {
    configArray.push(...tomlConfig)
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

    {
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      name: namer('linter options'),
    },

    ...configArray,
    ...configs,
  )
}
