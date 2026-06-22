import { createRequire } from 'node:module'

import { getModuleRoot } from './get-module-root.js'

export class OptionalImport<TModule = unknown> {
  readonly moduleSpecifier: string
  private matchSubpaths?: boolean
  private missing?: boolean
  private module?: TModule
  private readonly moduleRoot: string
  private nodeRequire?: NodeJS.Require

  constructor(specifier: string, options?: ImportResolverOptions) {
    this.moduleSpecifier = specifier
    this.moduleRoot = getModuleRoot(this.moduleSpecifier)
    this.matchSubpaths = options?.allowSubpathMatch
  }

  /**
   * Import the module if it can be resolved.
   * @returns the module
   */
  async load() {
    if (this.module !== undefined || this.missing) {
      return this.module
    }

    try {
      const m = (await import(this.moduleSpecifier)) as TModule
      this.module = m
      this.missing = false
      return this.module
    } catch (error) {
      if (this.isMissingImportError(error)) {
        this.missing = true
        return
      }
      // if (!Error.isError())
      throw error
    }
  }

  async loadDefault() {
    const m = (await this.load()) as Record<string, unknown> & { default?: TModule }
    if (m !== undefined) {
      return (m?.default ?? m) as TModule
    }
    return
  }

  require() {
    if (this.module !== undefined || this.missing) {
      return this.module
    }

    if (!this.nodeRequire) {
      this.nodeRequire = createRequire(import.meta.url)
    }

    try {
      const m = this.nodeRequire(this.moduleSpecifier) as TModule
      this.module = m
      this.missing = false
      return this.module
    } catch (error) {
      if (this.isMissingImportError(error)) {
        this.missing = true
        return
      }
      throw error
    }
  }

  resolve() {
    if (this.missing) {
      return
    }

    if (!this.nodeRequire) {
      this.nodeRequire = createRequire(import.meta.url)
    }

    try {
      return this.nodeRequire.resolve(this.moduleSpecifier)
    } catch (error) {
      if (this.isMissingImportError(error)) {
        this.missing = true
        return
      }
      throw error
    }
  }

  /**
   * Extract the target specifier from an error message.
   * @param message the error message
   * @returns the assumed target, or undefined if the message doesn't match any of the expected patterns
   */
  private static extractMissingTarget(message: string) {
    const esmExp = /Cannot find (?:package|module) ['"]([^'"]+)['"]/i
    const cjsExp = /Cannot find module ['"]([^'"]+)['"]/i
    if (esmExp.test(message)) {
      return esmExp.exec(message)?.[1]
    } else if (cjsExp.test(message)) {
      return cjsExp.exec(message)?.[1]
    } else {
      return
    }
  }

  /**
   * Detect whether an import error indicates that the requested specifier is missing, as opposed to one of its transitive dependencies. This is necessarily heuristic because Node error shapes/messages vary by version.
   * @param error the captured error
   * @returns true if the error is caused by attempting to import this module; false otherwise
   */
  private isMissingImportError(error?: unknown) {
    if (this.missing !== undefined) {
      return this.missing
    }

    if (!isNodeError(error)) {
      return
    }

    const { code, message } = error
    if ((code !== 'ERR_MODULE_NOT_FOUND' && code !== 'MODULE_NOT_FOUND') || !message) {
      return false
    }

    const target = OptionalImport.extractMissingTarget(message)
    if (target) {
      return this.isSameOrSubpath(target)
    }
    return false
  }

  /**
   * Determine whether the target is the requested module, or a subpath of it.
   * @param target the identified target specifier
   * @returns true if {@link target} is a subpath of this module; false otherwise
   */
  private isSameOrSubpath(target: string) {
    return (
      target === this.moduleSpecifier ||
      (this.matchSubpaths === true && target.startsWith(`${this.moduleRoot}/`))
    )
  }
}

export interface ImportResolverOptions {
  /**
   * Treat package subpaths as belonging to the same package.
   * @default true
   */
  allowSubpathMatch?: boolean
  /**
   * Cache resolved promises/results for each specifier.
   * @default true
   */
  cache?: boolean
}

function isNodeError(value: unknown): value is NodeLikeError {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const keys = ['code', 'message'] as const
  const has = (prop: (typeof keys)[number]) =>
    (value as NodeLikeError)[prop] === undefined ||
    typeof (value as NodeLikeError)[prop] === 'string'
  return keys.every(e => has(e))
}

interface NodeLikeError {
  code?: string
  message?: string
}
