import { logger, OverwriteStrategy, readJson, Tree } from '@nx/devkit'

import type { Tsconfig } from 'tsconfig-type'

import { isEmpty } from './is-empty'
import { owStrategy } from './overwrite-strategy'
import { PickNonNullable, PickRequired, toArray } from './type-utils'

/**
 * Encapsulate operations on a `tsconfig.json` file.
 */
export class TSConfig implements TSConfigType {
  private $config: TSConfigType

  /**
   * Construct a new TSConfig instance.
   * @param $tree the NX virtual file system
   * @param $path the path to the `tsconfig.json`
   * @param $options options that specify how to interact with the filesystem
   */
  constructor(
    private $tree: Tree,
    private $path: string,
    private $options: TSConfigOptions = {},
  ) {
    const config = $tree.exists($path) ? readJson<Tsconfig>($tree, $path) : {}
    this.$config = TSConfig.normalize(config)
  }

  get compilerOptions(): TSConfigType['compilerOptions'] {
    return this.$config.compilerOptions
  }

  set compilerOptions(value: Tsconfig['compilerOptions']) {
    this.$config.compilerOptions = TSConfig.normalizeCompilerOptions(value)
  }

  get exclude(): TSConfigType['exclude'] {
    return this.$config.exclude
  }

  set exclude(value: string | Tsconfig['exclude']) {
    this.$config.exclude = toArray(value)
  }

  /**
   * Indicates that the file exists in the file system.
   */
  get exists() {
    return this.$tree.exists(this.$path)
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
   * Add types to the `types` option of {@link Tsconfig.compilerOptions}.
   * @param types the types to add
   */
  addTypes(...types: string[]) {
    const t = new Set(this.$config.compilerOptions.types)
    for (const type of types) {
      if (type) {
        t.add(type)
      }
    }
    this.$config.compilerOptions.types = [...t]
  }

  apply(config: Tsconfig) {
    this.$config = TSConfig.normalize(config)
  }

  /**
   * Remove types from the `types` option of {@link Tsconfig.compilerOptions}.
   * @param types the types to remove
   */
  removeTypes(...types: string[]) {
    const ts = this.types
    for (const type of types) {
      ts.delete(type)
    }
    this.types = [...ts]
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

    return config
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

  /**
   * Write the config to the file system. File is unformatted since this method is intended for use within a generator, which will format everything at once.
   * @param tree the NX virtual file system
   * @param path the path to the `tsconfig.json`
   * @param options options that specify how to interact with the filesystem
   */
  write(tree?: Tree, path?: string, options?: TSConfigOptions) {
    this.$tree = tree ?? this.$tree
    this.$path = path ?? this.$path
    this.$options = options ?? this.$options

    if (this.exists) {
      if (this.overwriteStrategy === OverwriteStrategy.ThrowIfExisting) {
        throw new Error(`${this.$path} may not be overwritten`)
      } else if (this.overwriteStrategy === OverwriteStrategy.KeepExisting) {
        logger.warn(`Refusing to overwrite existing configuration file: ${this.$path}`)
      }
    }

    if (!this.exists || this.overwriteStrategy === OverwriteStrategy.Overwrite) {
      this.$tree.write(this.$path, this.toString())
    }
  }

  static normalize(config: Tsconfig): TSConfigType {
    return {
      ...config,
      compilerOptions: TSConfig.normalizeCompilerOptions(config.compilerOptions),
      exclude: toArray(config.exclude),
      extends: toArray(config.extends),
      files: toArray(config.files),
      include: toArray(config.include),
      references: TSConfig.normalizeReferences(config.references),
    }
  }

  static normalizeCompilerOptions(options: Tsconfig['compilerOptions']) {
    return Object.entries(options ?? {}).reduce(
      (acc, [key, value]) => {
        if (!isEmpty(value)) {
          if (Array.isArray(value)) {
            const values = value.filter(e => !isEmpty(e))
            acc[key] = key === 'types' ? [...new Set(values)] : values
          } else {
            acc[key] = value
          }
        }
        return acc
      },
      {} as Record<string, any>,
    ) satisfies TSConfigType['compilerOptions']
  }

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
   * @param tree the NX virtual file system
   * @param path the path to the `tsconfig.json`
   * @param options options that specify how to interact with the filesystem
   * @returns a new instance of {@link TSConfig}
   */
  static read(tree: Tree, path: string, options?: TSConfigOptions) {
    if (!tree.exists(path)) {
      throw new Error(`Missing file: ${path}`)
    }

    return new TSConfig(tree, path, options)
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

  private get types(): Set<string> {
    return new Set(toArray(this.compilerOptions.types))
  }

  private set types(value: string | (string | null)[] | null | undefined) {
    this.$config.compilerOptions.types = toArray(value)
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

export type TSConfigType = Pick<
  Tsconfig,
  | '$schema'
  | 'buildOptions'
  | 'compileOnSave'
  | 'ts-node'
  | 'typeAcquisition'
  | 'watchOptions'
> &
  PickRequired<
    Tsconfig,
    'exclude' | 'extends' | 'files' | 'include' | 'references',
    true
  > &
  Required<PickNonNullable<Tsconfig, 'compilerOptions', true>>

type TSConfigReference = TSConfigType['references'][number]
