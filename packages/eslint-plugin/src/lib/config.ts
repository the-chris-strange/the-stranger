import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

/**
 * Flatten a (potentially infinitely) nested array of configuration objects or {@link ConfigBuilder} functions into an array of configs.
 * @param configs an array of config objects, config builders, or nested arrays of these
 * @returns a flat array of config objects
 */
export async function config(
  ...configs: ConfigLike[]
): Promise<FlatConfig.ConfigArray> {
  const flatConfigs: FlatConfig.ConfigArray = []
  for (const cfg of configs) {
    if (Array.isArray(cfg)) {
      flatConfigs.push(...(await config(...cfg)))
    } else if (typeof cfg === 'function') {
      const result = await cfg()
      if (result !== undefined) {
        flatConfigs.push(...(await config(result)))
      }
    } else if (cfg !== undefined) {
      flatConfigs.push(cfg)
    }
  }
  return flatConfigs
}

/**
 * A function that returns a config object, an array of config objects, undefined, or some nested structure of these. Because who doesn't love infinite recursion?
 */
export type ConfigBuilder = () => ConfigLike | Promise<ConfigLike>

/**
 * Either an {@link InfinitelyNestedConfig} or undefined.
 */
export type ConfigLike = InfinitelyNestedConfig | undefined

/**
 * A configuration object, an array of configuration objects, a {@link ConfigBuilder} function, or some nested structure of these.
 */
export type InfinitelyNestedConfig =
  | ConfigBuilder
  | FlatConfig.Config
  | FlatConfig.ConfigArray
  | InfinitelyNestedConfig[]
