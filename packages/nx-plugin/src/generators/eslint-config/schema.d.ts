import type { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Options accepted by `configure()` from `@the-stranger/eslint-config`.
 */
export interface ConfigureOptions {
  json?: boolean | JsonOptions
  nx?: boolean | object[]
  source?: boolean | SourceCodeOptions
  tests?: false | TestFileOptions
  toml?: boolean
  yaml?: boolean | YamlOptions
}

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
   * List of files to append to the {@link ignoredFiles} option. This option is not part of the implementation of the rule, but is included here to allow additional values to be passed to the `ignoredFiles` option, while still allowing the generator to detect sane defaults.
   */
  extraIgnoredFiles?: string[]
  /**
   * List of dependencies to ignore for checks. Certain React-specific dependencies are added to React libraries - otherwise this is passed straight through.
   */
  ignoredDependencies?: string[]
  /**
   * List of files to ignore when collecting dependencies.
   */
  ignoredFiles?: string[]
  /**
   * Enable to collect dependencies of children projects. Included for completeness, though not likely needed in one of my workspaces.
   */
  includeTransitiveDependencies?: boolean
  /**
   * Set workspace dependencies as relative file:// paths. Included for completeness, though not likely needed in one of my workspaces.
   */
  useLocalPathsForWorkspaceDependencies?: boolean
}

/**
 * Options for the ESLint configuration generator.
 */
export interface ESLintConfigSchema extends DependencyCheckOptions, GeneratorSchema {
  /**
   * JavaScript expressions or config objects to append as additional `configure()` arguments. Only supported for workspace configs.
   */
  additionalConfigs?: (object | string)[]
  /**
   * Generate a workspace-level config or a project-level config. Defaults to `project` when {@link project} is provided, otherwise `workspace`.
   */
  configType?: ConfigType
  /**
   * Options to pass as the first argument to `configure()`.
   */
  configureOptions?: ConfigureOptions
  /**
   * Specify a configuration file to extend. If unspecified, the configuration file at the root of the workspace is used.
   */
  extend?: string
  /**
   * The name of the project in which to generate an eslint config.
   */
  project?: string
}

type ConfigType = 'project' | 'workspace'

interface JavascriptOptions {
  browser?: boolean
  node?: boolean
}

interface JsonOptions {
  sort?: boolean | JsonSortOptions
}

interface JsonSortOptions {
  nx?: boolean
  tsconfig?: boolean
  vscode?: boolean
}

interface ReactOptions {
  astro?: boolean
  typeChecked?: boolean
  typescript?: boolean
}

interface SourceCodeOptions {
  agentSkills?: boolean
  js?: boolean | JavascriptOptions
  jsdoc?: boolean
  node?: boolean
  promise?: boolean
  react?: boolean | ReactOptions
  regexp?: boolean
  sort?: boolean
  ts?: boolean | TypescriptOptions
  unicorn?: boolean
}

interface TestFileOptions {
  disallowedWords?: string[]
  e2eTestRunner?: 'cypress' | 'playwright'
  unitTestRunner?: 'jest' | 'vitest'
}

interface TypescriptOptions {
  strict?: boolean
  typeChecked?: boolean
  typescript?: boolean
}

interface YamlOptions {
  sort?: boolean | YamlSortOptions
}

interface YamlSortOptions {
  cspellConfig?: boolean
  dependabotConfig?: boolean
  githubActions?: boolean
  markdownlintConfig?: boolean
  yarnrc?: boolean
}
