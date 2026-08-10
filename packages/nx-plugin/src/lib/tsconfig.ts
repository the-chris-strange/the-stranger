import { type Tree, logger, OverwriteStrategy } from '@nx/devkit'

import type { TsConfigJson } from 'get-tsconfig'
import type { LiteralUnion, Paths, SetFieldType, SetRequired } from 'type-fest'

import { FileNotFoundError } from './errors/file-not-found'
import { exists } from './exists'
import { isEmpty } from './is-empty'
import { maybeReadJson, writeJson } from './json'
import { owStrategy } from './overwrite-strategy'
import { parsePath } from './property-path/index'
import { toArray } from './to-array'

/**
 * Encapsulate operations on a `tsconfig.json` file.
 */
export class TSConfig {
  readonly config: TSConfigType

  #options: TSConfigOptions
  #path: string
  #tree?: Tree

  /**
   * Construct a new TSConfig instance.
   * @param path the path to the `tsconfig.json`
   * @param tree the NX virtual file system
   * @param options options that specify how to interact with the filesystem
   */
  constructor(path: string, tree?: Tree, options?: TSConfigOptions) {
    this.#path = path
    this.#tree = tree
    this.#options = options ?? {}
    this.config = TSConfig.normalize(maybeReadJson(path, tree) ?? {})
  }

  /**
   * Normalize a Tsconfig into a canonical TSConfigType object.
   * - compilerOptions are normalized via {@link TSConfig.normalizeCompilerOptions}
   * - exclude, extends, files and include are coerced to arrays via {@link toArray}
   * - references are normalized via {@link TSConfig.normalizeReferences}
   * @param config the input Tsconfig to normalize
   * @returns a new TSConfigType with normalized compiler options, array fields, and references
   */
  static normalize(config: TsConfigJson): TSConfigType {
    const { compilerOptions, exclude, files, include, references, ...cfg } = config
    return {
      ...structuredClone(cfg),
      compilerOptions: TSConfig.normalizeCompilerOptions(compilerOptions),
      exclude: toArray(exclude),
      extends: toArray(config.extends),
      files: toArray(files),
      include: toArray(include),
      references: TSConfig.normalizeReferences(references),
    }
  }

  /**
   * Normalize a tsconfig `compilerOptions` object.
   * @param options the raw `compilerOptions` object
   * @returns the normalized `compilerOptions` object
   */
  static normalizeCompilerOptions(
    options: TsConfigJson['compilerOptions'],
  ): NonNullable<TsConfigJson['compilerOptions']> {
    return Object.entries(options ?? {}).reduce<
      NonNullable<TsConfigJson['compilerOptions']>
    >((normalized, [key, value]) => {
      if (key === 'paths') {
        const paths = TSConfig.normalizePaths(value as CompilerOptions['paths'])
        if (!isEmpty(paths)) {
          normalized.paths = paths
        }
      } else if (key === 'types') {
        const types = TSConfig.normalizeTypes(value as CompilerOptions['types'])
        if (types.length > 0) {
          normalized.types = types
        }
      } else if (!isEmpty(value)) {
        normalized[key as keyof CompilerOptions] = Array.isArray(value)
          ? value.filter(entry => !isEmpty(entry)).map(entry => structuredClone(entry))
          : (structuredClone(value) as any)
      }
      return normalized
    }, {})
  }

  /**
   * Normalize compiler option path aliases.
   * @param paths the raw compilerOptions.paths object
   * @returns path aliases with empty values removed and targets deduplicated
   */
  static normalizePaths(paths: CompilerOptions['paths']) {
    return Object.entries(paths ?? {}).reduce<Record<string, string[]>>(
      (normalized, [name, values]) => {
        const targets = TSConfig.normalizeTypes(values)
        if (!isEmpty(name) && targets.length > 0) {
          normalized[name] = targets
        }
        return normalized
      },
      {},
    )
  }

  /**
   * Normalize tsconfig `references`.
   * @param value references to normalize
   * @returns valid references deduplicated by path
   */
  static normalizeReferences(
    value:
      readonly (string | TSConfigReference)[] | string | TsConfigJson['references'],
  ) {
    const references = new Map<string, TSConfigReference>()

    for (const candidate of toArray(value as string | TSConfigReference)) {
      const reference =
        typeof candidate === 'string'
          ? { path: candidate }
          : isProjectReference(candidate)
            ? structuredClone(candidate)
            : undefined

      if (reference && !isEmpty(reference.path) && !references.has(reference.path)) {
        references.set(reference.path, reference)
      }
    }

    return [...references.values()]
  }

  /**
   * Normalize an ordered string collection.
   * @param values values to normalize
   * @returns non-empty values deduplicated in first-seen order
   */
  static normalizeTypes(values: string | string[] | null | undefined) {
    return [...new Set(toArray(values).filter(value => !isEmpty(value)))]
  }

  /**
   * Read a tsconfig file from the file system.
   * @param path the path to the `tsconfig.json`
   * @param tree the NX virtual file system
   * @param options options that specify how to interact with the filesystem
   * @returns a new instance of {@link TSConfig}
   */
  static read(path: string, tree?: Tree, options?: TSConfigOptions) {
    if (!exists(path, tree)) {
      throw new FileNotFoundError(path)
    }

    return new TSConfig(path, tree, options)
  }

  /**
   * Add targets to a compiler option path alias.
   * @param name the path alias
   * @param paths targets to add
   */
  addPath(name: string, ...paths: string[]) {
    if (isEmpty(name)) return

    const existing = this.config.compilerOptions.paths?.[name] ?? []
    const targets = TSConfig.normalizeTypes([...existing, ...paths])
    if (targets.length === 0) return

    this.config.compilerOptions.paths ??= {}
    this.config.compilerOptions.paths[name] = targets
  }

  /**
   * Add references, preserving the first reference for each path.
   * @param values references to add
   */
  addReferences(...values: (string | TSConfigReference)[]) {
    this.config.references = TSConfig.normalizeReferences([
      ...this.config.references,
      ...values,
    ])
  }

  /**
   * Add types to `compilerOptions.types`.
   * @param types types to add
   */
  addTypes(...types: string[]) {
    const normalized = TSConfig.normalizeTypes([
      ...(this.config.compilerOptions.types ?? []),
      ...types,
    ])
    if (normalized.length > 0) {
      this.config.compilerOptions.types = normalized
    }
  }

  /**
   * Deeply patch the working config. Plain objects merge and arrays replace.
   * @param config patch to apply
   */
  apply(config: TsConfigJson) {
    const normalized = TSConfig.normalize(mergeDeep(this.config, config))

    for (const key of Object.keys(this.config)) {
      Reflect.deleteProperty(this.config, key)
    }
    Object.assign(this.config, normalized)
  }

  /**
   * Remove a compiler option path alias.
   * @param name the path alias
   */
  removePath(name: string) {
    const paths = this.config.compilerOptions.paths
    if (!paths) return

    Reflect.deleteProperty(paths, name)
    if (isEmpty(paths)) {
      delete this.config.compilerOptions.paths
    }
  }

  /**
   * Remove references by path.
   * @param paths reference paths to remove
   */
  removeReferences(...paths: string[]) {
    const removed = new Set(TSConfig.normalizeTypes(paths))
    this.config.references = this.config.references.filter(
      reference => !removed.has(reference.path),
    )
  }

  /**
   * Remove types from `compilerOptions.types`.
   * @param types types to remove
   */
  removeTypes(...types: string[]) {
    const removed = new Set(TSConfig.normalizeTypes(types))
    const remaining = (this.config.compilerOptions.types ?? []).filter(
      type => !removed.has(type),
    )

    if (remaining.length > 0) {
      this.config.compilerOptions.types = remaining
    } else {
      delete this.config.compilerOptions.types
    }
  }

  /**
   * Replace the targets for a compiler option path alias.
   * @param name the path alias
   * @param paths replacement targets
   */
  setPath(name: string, ...paths: string[]) {
    if (isEmpty(name)) return

    const targets = TSConfig.normalizeTypes(paths)
    if (targets.length === 0) {
      this.removePath(name)
      return
    }

    this.config.compilerOptions.paths ??= {}
    this.config.compilerOptions.paths[name] = targets
  }

  /**
   * Replace all references.
   * @param values replacement references
   */
  setReferences(...values: (string | TSConfigReference)[]) {
    this.config.references = TSConfig.normalizeReferences(values)
  }

  /**
   * Replace `compilerOptions.types`.
   * @param types replacement types
   */
  setTypes(...types: string[]) {
    const normalized = TSConfig.normalizeTypes(types)
    if (normalized.length > 0) {
      this.config.compilerOptions.types = normalized
    } else {
      delete this.config.compilerOptions.types
    }
  }

  [Symbol.dispose]() {
    if (this.#options.autoSave) {
      this.write()
    }
  }

  /**
   * Create a detached, minimal JSON object from the working config.
   * @returns the plain JSON object
   */
  toJSON(): TsConfigJson {
    const source = structuredClone(this.config)
    const includedProperties = (this.#options.includeProperties ?? []).map(property =>
      parsePropertyPath(property),
    )
    const normalized = TSConfig.normalize(source)

    for (const path of includedProperties) {
      copyPropertyAtPath(source, normalized, path)
    }

    const config = pruneEmpty(normalized, includedProperties) as TsConfigJson

    if (Array.isArray(config.extends) && config.extends.length === 1) {
      config.extends = config.extends[0]
    }

    return config
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

  /**
   * Write the config to the file system. File is unformatted since this method is intended for use within a generator, which will format everything at once.
   * @param path the path to the `tsconfig.json`
   * @param tree the NX virtual file system
   * @param options options that specify how to interact with the filesystem
   */
  write(path?: string, tree?: Tree, options?: TSConfigOptions) {
    this.#path = path ?? this.#path
    this.#tree = tree ?? this.#tree
    this.#options = options ?? this.#options

    const fileExists = exists(this.#path, this.#tree)

    if (fileExists) {
      if (this.overwriteStrategy === OverwriteStrategy.ThrowIfExisting) {
        throw new Error(`${this.#path} may not be overwritten`)
      } else if (this.overwriteStrategy === OverwriteStrategy.KeepExisting) {
        logger.warn(`Refusing to overwrite existing configuration file: ${this.#path}`)
      }
    }

    if (!fileExists || this.overwriteStrategy === OverwriteStrategy.Overwrite) {
      writeJson(this.#path, this.toJSON(), this.#tree)
    }
  }

  private get overwriteStrategy(): OverwriteStrategy {
    return typeof this.#options.overwriteStrategy === 'string'
      ? this.#options.overwriteStrategy
      : owStrategy(this.#options.overwriteStrategy)
  }
}

export function isProjectReference(value?: unknown): value is TSConfigReference {
  return (
    value !== null &&
    typeof value === 'object' &&
    'path' in value &&
    typeof value.path === 'string'
  )
}

export interface TSConfigOptions {
  /**
   * Save (write) the tsconfig.json file when the object is disposed.
   */
  autoSave?: boolean
  /**
   * Select properties that should be included when writing the tsconfig.json to disk, even if they're empty. Paths use the property-path parser syntax and may be rooted with `$`.
   */
  includeProperties?: TsConfigJsonProperties[]
  /**
   * Specify how to handle existing files.
   */
  overwriteStrategy?: boolean | OverwriteStrategy
}

export type TSConfigReference = TSConfigType['references'][number]

export type TSConfigType = SetRequired<
  SetFieldType<TsConfigJson, 'extends', string[]>,
  'compilerOptions' | 'exclude' | 'extends' | 'files' | 'include' | 'references'
>

function copyPropertyAtPath(
  source: object,
  target: object,
  path: readonly PropertyKey[],
) {
  if (path.length === 0) return

  let sourceValue: unknown = source
  let targetValue: unknown = target

  for (const [index, key] of path.entries()) {
    if (
      !isObjectContainer(sourceValue) ||
      !Object.hasOwn(sourceValue, key) ||
      !isObjectContainer(targetValue)
    ) {
      return
    }

    const targetContainer = targetValue as Record<PropertyKey, unknown>

    if (index === path.length - 1) {
      targetContainer[key] = structuredClone(
        (sourceValue as Record<PropertyKey, unknown>)[key],
      )
      return
    }

    sourceValue = (sourceValue as Record<PropertyKey, unknown>)[key]
    if (!isObjectContainer(targetContainer[key])) {
      targetContainer[key] = typeof path[index + 1] === 'number' ? [] : {}
    }
    targetValue = targetContainer[key]
  }
}

function isObjectContainer(value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function mergeDeep<T extends object>(value: T, patch: object): T {
  const merged = structuredClone(value) as Record<string, unknown>

  for (const [key, patchValue] of Object.entries(patch)) {
    const currentValue = merged[key]
    merged[key] =
      isPlainObject(currentValue) && isPlainObject(patchValue)
        ? mergeDeep(currentValue, patchValue)
        : structuredClone(patchValue)
  }

  return merged as T
}

function parsePropertyPath(source: string): PropertyPath {
  return parsePath(source).segments.map(segment =>
    segment.type === 'index' ? segment.index : segment.key,
  )
}

function pruneEmpty(
  value: unknown,
  includedProperties: readonly PropertyPath[],
  path: readonly PropertyKey[] = [],
): unknown {
  if (Array.isArray(value)) {
    return structuredClone(value)
  }

  if (!isPlainObject(value)) {
    return structuredClone(value)
  }

  const pruned: Record<string, unknown> = {}
  for (const [key, childValue] of Object.entries(value)) {
    const childPath = [...path, key]
    const child = pruneEmpty(childValue, includedProperties, childPath)
    const includesDescendant = includedProperties.some(included =>
      startsWithPath(included, childPath),
    )

    if (includesDescendant || !isEmpty(child)) {
      pruned[key] = child
    }
  }

  return pruned
}

function startsWithPath(path: PropertyPath, prefix: readonly PropertyKey[]) {
  return (
    path.length >= prefix.length && prefix.every((key, index) => path[index] === key)
  )
}

type CompilerOptions = Exclude<TsConfigJson['compilerOptions'], null | undefined>

type PropertyKey = number | string

type PropertyPath = readonly PropertyKey[]

type TsConfigJsonProperties = LiteralUnion<Paths<TsConfigJson>, string>
