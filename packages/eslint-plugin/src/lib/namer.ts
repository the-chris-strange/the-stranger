import type { Linter } from 'eslint'
import { name as pkgName } from '../../package.json'

/**
 * Prepend the workspace's namespace or full name to a string. Useful for naming eslint configuration objects.
 * @param value the value to add to the name
 * @returns prefixed value
 */
export function namer(value?: string) {
  const ws = /(@[a-z-]+)\/.+/i.exec(pkgName)?.[0] ?? pkgName
  if (value) {
    return value.startsWith(ws) ? value : `${ws}/${value}`
  }
  return ws
}

/**
 * Set the `name` property of an ESLint config.
 * @param config the object
 * @param defaultName override the default behavior of this function
 * @returns the named config(s)
 */
export function objectNamer(config: Config, defaultName?: string): Named<Config> {
  if (defaultName) {
    return { ...config, name: defaultName }
  } else if (config.name) {
    return config as Named<Config>
  } else if (config.plugins) {
    const plugins = Object.keys(config.plugins)
    return { ...config, name: namer(plugins[0]) }
  } else {
    const rules = Object.keys(config.rules ?? {}).map(e => e.split('/')[0])
    const name = [...new Set(rules)].join('/')
    return { ...config, name }
  }
}

type N = { name?: string }

type Config = Linter.Config

/**
 * Make the name property of an object required. Preserves JSDoc comments for objects that already have a name property.
 */
export type Named<T extends object> = T & Required<T extends N ? Pick<T, 'name'> : N>
