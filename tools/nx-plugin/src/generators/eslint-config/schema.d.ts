import type { GeneratorSchema } from '@the-stranger/nx-plugin'

export interface EslintConfigGeneratorSchema extends GeneratorSchema {
  /**
   * JavaScript expressions to append as additional `configure()` arguments after the generated workspace defaults.
   */
  configureConfigExpressions?: string[]
  /**
   * Options to pass as the first argument to `configure()`.
   */
  configureOptions?: Record<string, unknown>
  dependencyChecksIgnore?: string[]
  dependencyChecksRuntime?: string[]
  /**
   * Specify a configuration file to extend. If unspecified, the configuration file at the root of the workspace is used.
   */
  extend?: string
  /**
   * Options to pass to the generated `moduleBoundaries()` config. Set to `false` to leave the `nx` option entirely controlled by `configureOptions`.
   */
  moduleBoundaries?: false | RootModuleBoundaryOptions
  /**
   * The name of the project in which to generate an eslint config.
   */
  project?: string
}

interface RootModuleBoundaryOptions {
  allow?: string[]
  allowCircularSelfDependency?: boolean
  banTransitiveDependencies?: boolean
  checkDynamicDependenciesExceptions?: string[]
  checkNestedExternalImports?: boolean
  depConstraints?: unknown[]
  enforceBuildableLibDependency?: boolean
  ignoredCircularDependencies?: [string, string][]
}
