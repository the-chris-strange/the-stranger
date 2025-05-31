import tseslint from 'typescript-eslint'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export async function buildSharedConfig(...configs: (ConfigBuilder | ConfigLike)[]) {
  const config = await Promise.all(
    configs.map(async e => (typeof e === 'function' ? await e() : e)),
  )
  return tseslint.config(config.filter(e => e !== undefined))
}

export type ConfigBuilder = () => ConfigLike | Promise<ConfigLike>

export type ConfigLike = FlatConfig.Config | FlatConfig.ConfigArray | undefined
