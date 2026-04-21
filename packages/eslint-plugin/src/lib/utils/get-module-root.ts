/**
 * Get the expected root of a module. For package specifiers, returns the package root; for non-package-like specifiers, returns the value as-is.
 * @param specifier the module specifier
 * @returns the root module specifier
 * @example
 * getModuleRoot('pg') // -> 'pg'
 * getModuleRoot('lodash/fp') // -> 'lodash'
 * getModuleRoot('@scope/pkg') // -> '@scope/pkg'
 * getModuleRoot('@scope/pkg/subpath') // -> '@scope/pkg'
 */
export function getModuleRoot(specifier: string) {
  if (!specifier) {
    return specifier
  }

  if (
    specifier.startsWith('./') ||
    specifier.startsWith('../') ||
    specifier.startsWith('/') ||
    specifier.startsWith('file:') ||
    specifier.startsWith('node:')
  ) {
    return specifier
  }

  if (specifier.startsWith('@')) {
    const parts = specifier.split('/')
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`
    }
    return specifier
  }

  const firstSlash = specifier.indexOf('/')
  return firstSlash === -1 ? specifier : specifier.slice(0, firstSlash)
}
