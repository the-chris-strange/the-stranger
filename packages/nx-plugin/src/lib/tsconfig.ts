import { OverwriteStrategy, readJson, Tree } from '@nx/devkit'

import type { CompilerOptionsDefinition, Tsconfig } from 'tsconfig-type'

import { isEmpty } from './is-empty'
import { owStrategy } from './overwrite-strategy'

/**
 * Encapsulates operations on a `tsconfig.json` file.
 */
export class TSConfig implements Tsconfig {
  private $config: Tsconfig

  /**
   * Construct a new TSConfig instance.
   * @param $tree the NX virtual file system
   * @param $path the path to the `tsconfig.json`
   * @param $options options that specify how to interact with the filesystem
   */
  constructor(
    private $tree: Tree,
    private $path: string,
    private $options?: TSConfigOptions,
  ) {
    this.$config = $tree.exists($path) ? readJson<Tsconfig>($tree, $path) : {}
  }

  get compilerOptions(): CompilerOptions {
    this.$config.compilerOptions ??= {}
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.$config.compilerOptions!
  }

  set compilerOptions(value) {
    this.$config.compilerOptions = value
  }

  get exclude(): string[] {
    this.$config.exclude ??= []
    return this.$config.exclude as string[]
  }

  set exclude(value: (string | null)[]) {
    this.$config.exclude = this.ensureStringArray(value)
  }

  get extends() {
    return this.$config.extends
  }

  set extends(value) {
    this.$config.extends = value
  }

  get files(): string[] {
    this.$config.files ??= []
    return this.$config.files as string[]
  }

  set files(value: (string | null)[]) {
    this.$config.files = this.ensureStringArray(value)
  }

  get include(): string[] {
    this.$config.include ??= []
    return this.$config.include as string[]
  }

  set include(value: (string | null)[]) {
    this.$config.include = this.ensureStringArray(value)
  }

  get references(): TsconfigReference[] {
    this.$config.references ??= []
    return this.$config.references as TsconfigReference[]
  }

  set references(value: (string | { path?: string | null } | null)[]) {
    this.$config.references = value.filter(typeGuardRefs).map(this.asRef)
  }

  /**
   * Add references to the {@link Tsconfig.references} configuration.
   * @param refs the references to add
   */
  addReference(...refs: (string | { path: string })[]) {
    this.references.push(...refs.map(this.asRef))
  }

  /**
   * Add types to the `types` option of {@link Tsconfig.compilerOptions}.
   * @param types the types to add
   */
  addTypes(...types: string[]) {
    this.$config.compilerOptions ??= {}
    const ts = this.getTypes()

    for (const type of types) {
      ts.add(type)
    }

    this.$config.compilerOptions.types = [...ts]
  }

  /**
   * Remove types from the `types` option of {@link Tsconfig.compilerOptions}.
   * @param types the types to remove
   */
  removeTypes(...types: string[]) {
    if (this.$config.compilerOptions?.types) {
      const ts = this.getTypes()

      for (const type of types) {
        ts.delete(type)
      }

      if (ts.size === 0) {
        delete this.$config.compilerOptions.types
      } else {
        this.$config.compilerOptions.types = [...ts]
      }
    }
  }

  /**
   * Create a minimal JSON object from the config. Only keys with a truthy value, or those specified in {@link TSConfigOptions.includeProperties}.
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

    // if (!this.includeProperty('compilerOptions') && isEmpty(config.compilerOptions)) {
    //   delete config.compilerOptions
    // }

    return config
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

  /**
   * Write the config to the file system. File is unformatted since this method is intended for use within a generator, which will eventually format everything with Prettier.
   * @param tree the NX virtual file system
   * @param path the path to the `tsconfig.json`
   * @param options options that specify how to interact with the filesystem
   */
  write(tree?: Tree, path?: string, options?: TSConfigOptions) {
    this.$tree = tree ?? this.$tree
    this.$path = path ?? this.$path
    this.$options = options ?? this.$options

    if (this.exists && this.overwriteStrategy === OverwriteStrategy.ThrowIfExisting) {
      throw new Error(`${this.$path} may not be overwritten`)
    } else if (!this.exists || this.overwriteStrategy === OverwriteStrategy.Overwrite) {
      this.$tree.write(this.$path, this.toString())
    }
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

  private asRef(value: string | { path: string }): TsconfigReference {
    return typeof value === 'string' ? { path: value } : value
  }

  private ensureStringArray(value?: (string | null)[] | null): string[] {
    return value?.filter(e => typeof e === 'string') ?? []
  }

  /**
   * Get a set of all non-null types defined in compilerOptions.types. If no types are defined, returns an empty set.
   * @returns a set containing non-null types
   */
  private getTypes() {
    return new Set(
      this.$config.compilerOptions?.types?.filter(e => typeof e === 'string'),
    )
  }

  /**
   * Check whether a value should be included in the JSON object to which this class serializes.
   * @param property the property to test
   * @returns true if the property should be included in the output
   */
  private includeProperty(property: keyof Tsconfig) {
    return this.$options?.includeProperties?.includes(property)
  }

  private get exists() {
    return this.$tree.exists(this.$path)
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

export function typeGuardRefs(
  value?: string | { path?: string | null } | null,
): value is string | { path: string } {
  return (
    typeof value === 'string' ||
    (typeof value === 'object' && typeof value?.path === 'string')
  )
}

export type CompilerOptions = NonNullable<
  Required<CompilerOptionsDefinition>['compilerOptions']
>

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

/**
 * A non-nullable element of the {@link Tsconfig.references} array.
 */
export interface TsconfigReference {
  path: string
}
