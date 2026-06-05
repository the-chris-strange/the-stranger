import nxPlugin from '@nx/eslint-plugin'
import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import * as jsoncParser from 'jsonc-eslint-parser'

import type { Config } from 'eslint/config'

import type { ConfigOptions } from './options.js'

import { namer } from './namer.js'

export function configureNx(nx: ConfigOptions['nx']): ConfigWithExtends[] {
  if (nx === false || nx === undefined) {
    return []
  }

  const configs = [
    {
      name: namer('nx'),
      plugins: { '@nx': nxPlugin as unknown as Plugin },
    },

    moduleBoundaries({
      allow: [String.raw`^.*/eslint(\.base)?\.config\.[cm]?[jt]s$`],
      depConstraints: [
        {
          onlyDependOnLibsWithTags: ['*'],
          sourceTag: '*',
        },
      ],
    }),
  ]

  if (Array.isArray(nx)) {
    configs.push(...nx)
  }

  return configs
}

/**
 * Create a config object that enables the `@nx/dependency-checks` rule with the specified options.
 * @param options options to pass to the rule
 * @returns the config object
 */
export function dependencyChecks(options?: DependencyCheckOptions): ConfigWithExtends {
  return {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    name: namer('nx/dependency-checks'),
    plugins: { '@nx': nxPlugin as unknown as Plugin },
    rules: {
      '@nx/dependency-checks': ['error', options],
    },
  }
}

/**
 * Create a config object that enables the `@nx/enforce-module-boundaries` rule with the specified options.
 * @param options options to pass to the rule
 * @returns the config object
 */
export function moduleBoundaries(options?: ModuleBoundaryOptions): ConfigWithExtends {
  return {
    files: getFilePatterns(FilePatterns.js, FilePatterns.ts, FilePatterns.react),
    name: namer('nx/module-boundaries'),
    plugins: { '@nx': nxPlugin as unknown as Plugin },
    rules: {
      '@nx/enforce-module-boundaries': ['error', options ?? {}],
    },
  }
}

/**
 * Options to pass to the `@nx/dependency-checks` rule.
 * @see https://nx.dev/nx-api/eslint-plugin/documents/dependency-checks#options for additional details and documentation on what these options do, and how to use them.
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
 * Options to pass to the `@nx/enforce-module-boundaries` rule.
 * @see https://nx.dev/nx-api/eslint-plugin/documents/enforce-module-boundaries#options for additional details and documentation on what these options do, and how to use them.
 */
export interface ModuleBoundaryOptions {
  /**
   * List of imports that should be allowed without any checks.
   */
  allow?: string[]
  /**
   * Disable to allow a project to import itself using its package name.
   */
  allowCircularSelfDependency?: boolean
  /**
   * Enable to ban imports of dependencies that are not explicitly listed in package manifests.
   */
  banTransitiveDependencies?: boolean
  /**
   * List of patterns to exclude from lazy-load checks.
   */
  checkDynamicDependenciesExceptions?: string[]
  /**
   * Enable to validate external imports for nested dependencies.
   */
  checkNestedExternalImports?: boolean
  /**
   * Constraints that define which projects may be depended on by tagged source projects.
   */
  depConstraints?: ModuleBoundariesDepConstraint[]
  /**
   * Enable to enforce that buildable libraries do not depend on non-buildable libraries.
   */
  enforceBuildableLibDependency?: boolean
  /**
   * List of source and target project pairs to ignore when checking circular dependencies.
   */
  ignoredCircularDependencies?: [string, string][]
}

interface ModuleBoundariesDepConstraint {
  /**
   * External imports that are explicitly allowed for this constraint.
   */
  allowedExternalImports?: string[]
  /**
   * A list of tags that must all be present on the source project.
   */
  allSourceTags?: string[]
  /**
   * External imports that are explicitly banned for this constraint.
   */
  bannedExternalImports?: string[]
  /**
   * The source project must not depend on projects with these tags.
   */
  notDependOnLibsWithTags?: string[]
  /**
   * The source project can depend only on projects with these tags.
   */
  onlyDependOnLibsWithTags?: string[]
  /**
   * A tag on the source project.
   */
  sourceTag?: string
}

type Plugin = Required<Required<Config>['plugins']>[string]
