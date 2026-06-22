import { getModuleRoot } from './get-module-root.js'

export class ImportResolver {
  private allowSubpathMatch: boolean
  private cache: Map<string, Promise<OptionalImportResult<unknown>>>
  private useCache: boolean

  constructor(options?: ImportResolverOptions) {
    this.useCache = options?.cache ?? true
    this.allowSubpathMatch = options?.allowSubpathMatch ?? true
    this.cache = new Map()
  }

  clear(specifier?: string) {
    if (specifier) {
      this.cache.delete(specifier)
    } else {
      this.cache.clear()
    }
  }

  has(specifier: string) {
    return this.cache.has(specifier)
  }

  async import<T = unknown>(specifier: string) {
    if (!this.useCache) {
      return this.loadModule<T>(specifier)
    }

    const cached = this.cache.get(specifier)
    if (cached) {
      return cached as Promise<OptionalImportResult<T>>
    }

    try {
      const pending = this.loadModule<T>(specifier)
      this.cache.set(specifier, pending)
      return await pending
    } catch (error) {
      this.cache.delete(specifier)
      throw error
    }
  }

  async importDefault<T = unknown>(specifier: string) {
    const result = await this.import<Record<string, unknown> & { default?: T }>(
      specifier,
    )

    if (!result.success) {
      return
    }

    return (result.module?.default ?? result.module) as T
  }

  async requireImport<T = unknown>(specifier: string): Promise<T | undefined> {
    const result = await this.import<T>(specifier)

    if (result.success) {
      return result.module
    }

    throw new Error(`Required dependency "${specifier}" is not installed.`)
  }

  /**
   * Narrow unknown to a Node-like error shape.
   * @param value the value
   * @returns the error-like object, or undefined if the value is not an object of the expected shape
   */
  private asNodeLikeError(value: unknown): NodeLikeError | undefined {
    if (typeof value !== 'object' || value === null) {
      return
    }

    const record = value as Record<string, unknown>
    const code = typeof record['code'] === 'string' ? record['code'] : undefined
    const message =
      typeof record['message'] === 'string' ? record['message'] : undefined

    return { code, message }
  }

  /**
   * Extract the target from CommonJS-style error messages like:
   * - Cannot find module 'pg'
   * @param message the error message
   * @returns the target, or undefined if the message doesn't match the expected pattern
   */
  private extractCannotFindModuleTarget(message: string) {
    const match = /Cannot find module ['"]([^'"]+)['"]/i.exec(message)
    return match?.[1]
  }

  /**
   * Extract the quoted missing target from error messages like:
   * - Cannot find package 'pg' imported from ...
   * - Cannot find module 'pg' imported from ...
   * @param message the error message
   * @returns the target, or undefined if the message doesn't match the expected pattern
   */
  private extractQuotedMissingTarget(message: string) {
    const match = /Cannot find (?:package|module) ['"]([^'"]+)['"]/i.exec(message)
    return match?.[1]
  }

  /**
   * Detect whether an import error means that the *requested* specifier is missing, as opposed to one of its transitive dependencies. This is necessarily heuristic because Node error shapes/messages vary by version.
   * @param error the captured error
   * @param specifier the value that was imported
   * @returns true if the error is caused by the requested module; false otherwise
   */
  private isRequestedModuleMissing(error: unknown, specifier: string): boolean {
    const err = this.asNodeLikeError(error)
    if (!err) {
      return false
    }

    // Common Node loader errors for missing modules in ESM/CJS contexts.
    const { code, message } = err
    if ((code !== 'ERR_MODULE_NOT_FOUND' && code !== 'MODULE_NOT_FOUND') || !message) {
      return false
    }

    const requestedPackageName = getModuleRoot(specifier)

    // ESM-style message often includes:
    //   Cannot find package 'pg' imported from ...
    //
    // or:
    //   Cannot find module 'pg' imported from ...
    //
    // If the missing target in the message matches the requested package (or exact
    // specifier where appropriate), we consider that a true "missing module".
    const quotedTarget = this.extractQuotedMissingTarget(message)
    if (quotedTarget) {
      if (quotedTarget === specifier) {
        return true
      }

      if (quotedTarget === requestedPackageName) {
        return true
      }

      if (this.isSameOrSubpath(quotedTarget, requestedPackageName)) {
        return true
      }

      return false
    }

    // Older/CommonJS-style message may look like:
    //   Cannot find module 'pg'
    const cjsTarget = this.extractCannotFindModuleTarget(message)
    if (cjsTarget) {
      if (cjsTarget === specifier) {
        return true
      }

      if (cjsTarget === requestedPackageName) {
        return true
      }

      if (this.isSameOrSubpath(cjsTarget, requestedPackageName)) {
        return true
      }

      return false
    }

    return false
  }

  /**
   * Determine whether the target is the requested module, or a subpath of it.
   * @param target the identified target specifier
   * @param requested the requested module specifier
   * @returns true if {@link target} is a subpath of {@link requested}; false otherwise
   * @example
   * isSubpathOfModule('@scope/pkg/subpath', '@scope/pkg') // -> true
   */
  private isSameOrSubpath(target: string, requested: string) {
    return (
      this.allowSubpathMatch &&
      (target === requested || target.startsWith(`${requested}/`))
    )
  }

  private async loadModule<T = unknown>(
    specifier: string,
  ): Promise<OptionalImportResult<T>> {
    try {
      const mod = (await import(specifier)) as T
      return { module: mod, success: true }
    } catch (error) {
      if (this.isRequestedModuleMissing(error, specifier)) {
        return { module: undefined, success: false }
      }
      throw error
    }
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

export interface NodeLikeError {
  code?: string
  message?: string
}

/**
 * The result of resolving an optional dependency.
 * @template TModule the expected type of the imported module
 */
export type OptionalImportResult<TModule> =
  | { module: TModule; success: true }
  | { module: undefined; success: false }
