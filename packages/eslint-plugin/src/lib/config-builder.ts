import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export type ConfigBuilder = (
  ...configs: NestedConfigs
) => Promise<FlatConfig.ConfigArray>

export type NestedConfigs = (FlatConfig.Config | FlatConfig.ConfigArray)[]
