import { type ConfigWithExtends, namer } from '@the-stranger/eslint-utils'
import { type Config, defineConfig, globalIgnores } from 'eslint/config'

import { tomlConfig } from './configs/toml.js'
import { configureJson } from './json.js'
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
      namer('global-ignore'),
    ),

    {
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      name: namer('linter-options'),
    },

    ...configArray,
    ...configs,
  )
}
