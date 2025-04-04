import { LibraryGeneratorSchema } from '@nx/devkit'

import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Possible file extensions for the eslint.config file.
 */
export type ConfigFileExtension = 'cjs' | 'mjs' | 'ts'

/**
 * Options to pass to the `@nx/dependency-checks` rule. Behaviors that differ from the default options are documented here. Additionally, these options are intentionally not available when invoking this generator from the command line.
 * @see https://nx.dev/nx-api/eslint-plugin/documents/dependency-checks#options for the default options
 */
export interface DependencyCheckOptions {
  /**
   * List of build target names.
   */
  buildTargets?: string[]
  /**
   * Disable to skip checking for missing dependencies.
   */
  checkMissingDependencies?: boolean
  /**
   * Disable to skip checking for unused dependencies.
   */
  checkObsoleteDependencies?: boolean
  /**
   * Disable to skip checking if version specifier matches installed version. Defaults to false in this workspace, since the version specifiers used by yarn workspaces don't match what the rule expects.
   * @default false
   */
  checkVersionMismatches?: boolean
  /**
   * List of dependencies to ignore for checks. Certain React-specific dependencies are added to React libraries - otherwise this is passed straight through.
   */
  ignoredDependencies?: string[]
  /**
   * List of files to ignore when collecting dependencies. Default behavior for this workspace is to append the value of this option to the workspace defaults of `{projectRoot}/eslint.config.{ts,js,cjs,mjs}` and `{projectRoot}/vite.config.{ts,js,mjs,mts}`.
   */
  ignoredFiles?: string[]
  /**
   * Enable to collect dependencies of children projects. Included for completeness, but likely not needed in this workspace.
   */
  includeTransitiveDependencies?: boolean
  /**
   * Set workspace dependencies as relative file:// paths. Included for completeness, but likely not needed in this workspace.
   */
  useLocalPathsForWorkspaceDependencies?: boolean
}

/**
 * Options for the ESLint configuration generator.
 */
export interface ESLintConfigSchema extends ExternalOptions {
  /**
   * The name of the project in which to generate an eslint config.
   */
  project: string
  /**
   * Specify a configuration file to extend. If not specified, the configuration file at the root of the workspace is used.
   */
  extend?: string
  /**
   * The file extension to use for the generated config. The file extension of the workspace's root eslint.config file is used by default.
   */
  fileExtension?: ConfigFileExtension
}

type ExternalOptions = DependencyCheckOptions &
  GeneratorSchema &
  Partial<Pick<LibraryGeneratorSchema, 'unitTestRunner'>>
