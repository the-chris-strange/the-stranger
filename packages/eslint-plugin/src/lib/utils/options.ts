import {
  type ConfigOptions,
  type Options,
  configure,
} from '@the-stranger/eslint-config'

import type { Config } from 'eslint/config'

export function disableExcept<K extends keyof ConfigOptions>(
  config: Options,
  ...keys: K[]
): Config[] {
  return configure(disableOptionsExcept(config, ...keys))
}

export function disableOptionsExcept<K extends keyof ConfigOptions>(
  config: Options,
  ...keys: K[]
) {
  const configKeys = [
    'json',
    'source',
    'nx',
    'tests',
    'toml',
    'yaml',
  ] satisfies (keyof ConfigOptions)[]

  const keySet = new Set(keys as string[])

  for (const key of configKeys) {
    if (keySet.has(key)) {
      config[key] ??= true
    } else {
      config[key] = false
    }
  }

  return config
}
