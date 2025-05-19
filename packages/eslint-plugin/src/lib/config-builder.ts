import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint'

export type NestedConfigs = (FlatConfig.Config | FlatConfig.ConfigArray)[]

export type ConfigBuilder = (...configs: NestedConfigs) => Promise<FlatConfig.ConfigArray>
