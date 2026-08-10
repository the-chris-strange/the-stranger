import type { ConfigWithExtends } from './types.js'

import { namer } from './namer.js'

/**
 * Set the `name` property of an object. Useful for ensuring an ESLint config object has a name.
 * @internal
 * @param config the object
 * @param name override the default behavior of this function
 * @returns the named config
 */
export function objectNamer(
  config: ConfigWithExtends,
  name?: string,
): Named<ConfigWithExtends> {
  if (config.name) {
    return config as Named<ConfigWithExtends>
  } else if (name) {
    return { ...config, name: name }
  } else if (config.plugins) {
    const plugins = Object.keys(config.plugins)
    return { ...config, name: namer(plugins[0]) }
  } else {
    const rules = Object.keys(config.rules ?? {}).map(e => e.split('/')[0])
    const name = [...new Set(rules)].join('/')
    return { ...config, name }
  }
}

/**
 * Make the name property of an object required. Preserves JSDoc comments for objects that already have a name property.
 * @internal
 */
export type Named<T extends object> = Required<T extends N ? Pick<T, 'name'> : N> & T

type N = { name?: string }
