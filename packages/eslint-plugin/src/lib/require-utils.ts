import { createRequire } from 'node:module'

export function moduleExists(name: string) {
  try {
    createRequire(import.meta.filename).resolve(name)
    return true
  } catch {
    return false
  }
}

export function requireModule<T>(moduleName: string, ...dependencies: string[]) {
  const require = createRequire(import.meta.filename)
  function req(force: true): T
  function req(force: boolean): Maybe<T>
  function req(force: boolean): Maybe<T> {
    for (const dep of dependencies) {
      try {
        require.resolve(dep)
      } catch {
        if (force) {
          throw new MissingDependencyError(dep)
        }
      }
    }
    if (force) {
      return require(moduleName).default
    }
    try {
      return require(moduleName).default
    } catch {
      return
    }
  }
  return req
}

export class MissingDependencyError extends Error {
  constructor(public dependency: string) {
    const msg = `A required dependency is missing: ${dependency}`
    super(`${msg}; install the missing dependency and try again.`)
    this.name = 'MissingDependencyError'
  }
}

/**
 * Maybe. Maybe not. Maybe fuck yourself.
 * @template T the thing that might be
 */
export type Maybe<T> = T | undefined
