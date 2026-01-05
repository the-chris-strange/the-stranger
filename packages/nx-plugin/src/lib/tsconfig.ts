import { existsSync } from 'node:fs'

import {
  logger,
  OverwriteStrategy,
  readJson,
  readJsonFile,
  Tree,
  writeJson,
  writeJsonFile,
} from '@nx/devkit'

import type { Tsconfig } from 'tsconfig-type'

import { isEmpty } from './is-empty'
import { owStrategy } from './overwrite-strategy'
import { toArray } from './to-array'
import { ExtendRequired, PickNonNullable } from './type-utils'

/**
 * Encapsulate operations on a `tsconfig.json` file.
 */
export class TSConfig implements TSConfigType {
  private $config: TSConfigType
  private $types: Set<string>

  /**
   * Construct a new TSConfig instance.
   * @param $path the path to the `tsconfig.json`
   * @param $tree the NX virtual file system
   * @param $options options that specify how to interact with the filesystem
   */
  constructor(
    private $path: string,
    private $tree?: Tree,
    private $options: TSConfigOptions = {},
  ) {
    const config = TSConfig.readJson($path, $tree) ?? {}
    this.$config = TSConfig.normalize(config)
    this.$types = new Set(this.$config.compilerOptions.types)
  }

  get compilerOptions(): TSConfigType['compilerOptions'] {
    return this.$config.compilerOptions
  }

  set compilerOptions(value: Tsconfig['compilerOptions']) {
    this.$config.compilerOptions = TSConfig.normalizeCompilerOptions(value)
    this.$types = new Set(this.$config.compilerOptions.types)
  }

  get exclude(): TSConfigType['exclude'] {
    return this.$config.exclude
  }

  set exclude(value: string | Tsconfig['exclude']) {
    this.$config.exclude = toArray(value)
  }

  get extends() {
    return this.$config.extends
  }

  set extends(value) {
    this.$config.extends = value
  }

  get files(): TSConfigType['files'] {
    return this.$config.files
  }

  set files(value: string | Tsconfig['files']) {
    this.$config.files = toArray(value)
  }

  get include(): TSConfigType['include'] {
    return this.$config.include
  }

  set include(value: string | Tsconfig['include']) {
    this.$config.include = toArray(value)
  }

  get references(): TSConfigType['references'] {
    return this.$config.references
  }

  set references(value: string | string[] | Tsconfig['references']) {
    this.$config.references = TSConfig.normalizeReferences(value)
  }

  /**
   * Add references to the {@link Tsconfig.references} array.
   * @param values references to add to the config
   */
  addReferences(...values: (string | TSConfigReference)[]) {
    for (const value of values) {
      const ref = typeof value === 'string' ? { path: value } : value
      if (!this.$config.references.some(e => e.path === ref.path)) {
        this.$config.references.push(ref)
      }
    }
  }

  /**
   * Add types to {@link Tsconfig.compilerOptions}.
   * @param types the types to add
   */
  addTypes(...types: string[]) {
    for (const type of types.filter(e => !isEmpty(e))) {
      this.$types.add(type)
    }
  }

  apply(config: Tsconfig) {
    Object.assign(this.$config, TSConfig.normalize(config))
  }

  /**
   * Remove types from the `types` option of {@link Tsconfig.compilerOptions}.
   * @param types the types to remove
   */
  removeTypes(...types: string[]) {
    for (const type of types) {
      this.$types.delete(type)
    }
  }

  /**
   * Create a minimal JSON object from the config containing only keys with a truthy value, or those specified in {@link TSConfigOptions.includeProperties}.
   * @returns the plain JSON object
   */
  toJSON(): Tsconfig {
    const config: Tsconfig = Object.fromEntries(
      Object.entries(this.$config).filter(
        ([key, value]) =>
          this.includeProperty(key as keyof Tsconfig) || !isEmpty(value),
      ),
    )

    if (this.includeProperty('references') || this.references) {
      config.references = this.references
    }

    if (Array.isArray(this.extends) && this.extends.length === 1) {
      this.extends = this.extends[0]
    }

    if (this.$types.size > 0) {
      config.compilerOptions ??= {}
      config.compilerOptions.types = [...this.$types]
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
    this.$path = path ?? this.$path
    this.$tree = tree ?? this.$tree
    this.$options = options ?? this.$options

    const exists = TSConfig.exists(this.$path, this.$tree)

    if (exists) {
      if (this.overwriteStrategy === OverwriteStrategy.ThrowIfExisting) {
        throw new Error(`${this.$path} may not be overwritten`)
      } else if (this.overwriteStrategy === OverwriteStrategy.KeepExisting) {
        logger.warn(`Refusing to overwrite existing configuration file: ${this.$path}`)
      }
    }

    if (!exists || this.overwriteStrategy === OverwriteStrategy.Overwrite) {
      if (this.$tree) {
        writeJson(this.$tree, this.$path, this.toJSON())
      } else {
        writeJsonFile(this.$path, this.toJSON())
      }
    }
  }

  /**
   * Check if a file exists, either in the NX virtual filesystem {@link Tree}, or in the actual file system.
   * @param path the path to a file
   * @param tree the NX virtual file system
   * @returns true if the file exists; false otherwise
   */
  private static exists(path: string, tree?: Tree) {
    if (tree) {
      return tree.exists(path)
    }
    return existsSync(path)
  }

  /**
   * Normalize a Tsconfig into a canonical TSConfigType object.
   * - compilerOptions are normalized via {@link TSConfig.normalizeCompilerOptions}
   * - exclude, extends, files and include are coerced to arrays via {@link toArray}
   * - references are normalized via {@link TSConfig.normalizeReferences}
   * @param config the input Tsconfig to normalize
   * @returns a new TSConfigType with normalized compiler options, array fields, and references
   */
  static normalize(config: Tsconfig): TSConfigType {
    const { compilerOptions, exclude, files, include, references, ...cfg } = config
    return {
      ...cfg,
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
   * - filter out keys with empty/nullish values (using {@link isEmpty})
   * - remove empty elements from array values
   * - deduplicate `types`
   * - non-array, non-empty values are preserved verbatim
   * @param options the raw `compilerOptions` object
   * @returns the normalized `compilerOptions` object
   */
  static normalizeCompilerOptions(options: Tsconfig['compilerOptions']) {
    return Object.entries(options ?? {}).reduce((acc, [key, value]) => {
      if (key === 'types') {
        const types = new Set(toArray(value as CompilerOptions['types']))
        if (types.size > 0) {
          acc[key] = [...types]
        }
      } else if (!isEmpty(value)) {
        acc[key] = Array.isArray(value) ? value.filter(e => !isEmpty(e)) : value
      }
      return acc
    }, {} as any) as TSConfigType['compilerOptions']
  }

  /**
   * Normalize tsconfig `references` into a flat array of {@link TSConfigReference} objects.
   * - filter out empty entries
   * - convert string entries to TSConfigReference objects
   * - preserves valid project reference objects
   * - returns an empty array for any unsupported input shapes
   * @param value a single path string, an array of path strings, or an array of tsconfig reference objects
   * @returns an array of TSConfigReference objects normalized for use in a tsconfig `references` section
   */
  static normalizeReferences(value: string | string[] | Tsconfig['references']) {
    const refs: TSConfigReference[] = []
    if (typeof value === 'string') {
      refs.push({ path: value })
    } else if (Array.isArray(value)) {
      for (const v of value.filter(e => !isEmpty(e))) {
        if (typeof v === 'string') {
          refs.push({ path: v })
        } else if (isProjectReference(v)) {
          refs.push(v)
        }
      }
    }
    return refs
  }

  /**
   * Read a tsconfig file from the file system.
   * @param path the path to the `tsconfig.json`
   * @param tree the NX virtual file system
   * @param options options that specify how to interact with the filesystem
   * @returns a new instance of {@link TSConfig}
   */
  static read(path: string, tree?: Tree, options?: TSConfigOptions) {
    if (!TSConfig.exists(path, tree)) {
      throw new Error(`Missing file: ${path}`)
    }

    return new TSConfig(path, tree, options)
  }

  /**
   * Read a tsconfig file without creating a new instance of {@link TSConfig}.
   * @param path the path to the `tsconfig.json`
   * @param tree the NX virtual file system
   * @returns the plain JSON content of the file
   */
  static readJson(path: string, tree?: Tree) {
    if (TSConfig.exists(path, tree)) {
      return tree ? readJson<Tsconfig>(tree, path) : readJsonFile<Tsconfig>(path)
    }
    return
  }

  /**
   * Check whether a value should be included in the JSON object to which this class serializes.
   * @param property the property to test
   * @returns true if the property should be included in the output
   */
  private includeProperty(property: keyof Tsconfig) {
    return this.$options?.includeProperties?.includes(property)
  }

  private get overwriteStrategy(): OverwriteStrategy {
    return typeof this.$options?.overwriteStrategy === 'string'
      ? this.$options.overwriteStrategy
      : owStrategy(this.$options?.overwriteStrategy)
  }

  private set overwriteStrategy(value: boolean | OverwriteStrategy | undefined) {
    this.$options ??= {}
    this.$options.overwriteStrategy = value
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
   * Specify how to handle existing files.
   */
  overwriteStrategy?: boolean | OverwriteStrategy
  /**
   * Select top-level properties that should be included in the tsconfig.json, even if they're empty.
   */
  includeProperties?: (keyof Tsconfig)[]
}

export type TSConfigReference = TSConfigType['references'][number]

export type TSConfigType = ExtendRequired<
  Omit<Tsconfig, 'compilerOptions'>,
  'exclude' | 'extends' | 'files' | 'include' | 'references',
  true
> &
  Required<PickNonNullable<Tsconfig, 'compilerOptions', true>>

type CompilerOptions = Exclude<Tsconfig['compilerOptions'], null | undefined>
