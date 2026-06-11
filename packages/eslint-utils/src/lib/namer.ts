import pkg from '../../package.json' with { type: 'json' }

/**
 * Prepend the workspace's namespace to a string. Useful for naming ESLint configuration objects.
 * @internal
 * @param value the value to add to the name
 * @returns prefixed value
 */
export function namer(value?: string) {
  const ws = /@[a-z-]+\/eslint/i.exec(pkg.name)?.[0] ?? pkg.name
  if (value) {
    return value.startsWith(ws) ? value : `${ws}/${value}`
  }
  return ws
}
