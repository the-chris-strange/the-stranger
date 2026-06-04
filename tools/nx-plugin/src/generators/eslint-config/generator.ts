import { join } from 'node:path'
import { inspect } from 'node:util'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'
import { formatFiles, owStrategy } from '@the-stranger/nx-plugin'

import type { EslintConfigGeneratorSchema } from './schema'

const DEFAULT_CONFIGURE_OPTIONS = {
  tests: {
    unitTestRunner: 'vitest',
  },
} satisfies NonNullable<EslintConfigGeneratorSchema['configureOptions']>

const DEFAULT_MODULE_BOUNDARIES = {
  allow: [String.raw`^.*/eslint(\.base)?\.config\.[cm]?[jt]s$`],
  depConstraints: [],
  enforceBuildableLibDependency: true,
} satisfies Exclude<EslintConfigGeneratorSchema['moduleBoundaries'], false | undefined>

const DEFAULT_MODULE_BOUNDARIES_EXPRESSION = `{
  allow: [String.raw\`^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$\`],
  depConstraints: [],
  enforceBuildableLibDependency: true,
}`

export async function eslintConfigGenerator(
  tree: Tree,
  options: EslintConfigGeneratorSchema,
) {
  const config = normalizeOptions(options)

  if (config.project) {
    generateProjectConfig(tree, config)
  } else {
    generateRootConfig(tree, config)
  }

  await formatFiles(tree, { ...options, skipFormat: options.skipFormat ?? false })
}

function addProjectPath(value: string): string {
  return value.replace(
    /^(?!\{(?:project|workspace)Root\})(.+)$/,
    `{projectRoot}/${value}`,
  )
}

function generateProjectConfig(tree: Tree, options: NormalizedOptions) {
  if (options.project === undefined) {
    throw new Error('Project config generation requires a project name.')
  }

  const project = readProjectConfiguration(tree, options.project)
  const baseConfig =
    options.extend ??
    joinPathFragments(offsetFromRoot(project.root), 'eslint.config.mjs')
  const dependencyChecksIgnore = [
    'eslint.config.{ts,js,cjs,mjs}',
    'src/**/*.spec.{ts,js,tsx,jsx}',
    'vite.config.{js,ts,mjs,mts}',
    'vitest.config.{js,ts,mjs,mts}',
    ...options.dependencyChecksIgnore,
  ].map(addProjectPath)

  const data = {
    dependencyChecksIgnore,
    dependencyChecksRuntime: options.dependencyChecksRuntime,
    paths: { baseConfig },
  }

  generateFiles(tree, join(__dirname, 'files', 'project'), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })
}

function generateRootConfig(tree: Tree, options: NormalizedOptions) {
  const data = {
    configureConfigExpressions: options.configureConfigExpressions,
    configureOptions: serialize(options.configureOptions),
    includeModuleBoundaries: options.moduleBoundaries !== false,
    moduleBoundaries:
      options.moduleBoundaries === DEFAULT_MODULE_BOUNDARIES
        ? DEFAULT_MODULE_BOUNDARIES_EXPRESSION
        : serialize(options.moduleBoundaries),
  }

  generateFiles(tree, join(__dirname, 'files', 'root'), '.', data, {
    overwriteStrategy: owStrategy(options.force),
  })
}

function normalizeOptions(options: EslintConfigGeneratorSchema): NormalizedOptions {
  return {
    configureConfigExpressions: options.configureConfigExpressions ?? [],
    configureOptions: options.configureOptions ?? DEFAULT_CONFIGURE_OPTIONS,
    dependencyChecksIgnore: options.dependencyChecksIgnore ?? [],
    dependencyChecksRuntime: options.dependencyChecksRuntime ?? [],
    extend: options.extend,
    force: options.force,
    moduleBoundaries: options.moduleBoundaries ?? DEFAULT_MODULE_BOUNDARIES,
    project: options.project,
    skipFormat: options.skipFormat,
  }
}

function serialize(value: unknown): string {
  return inspect(value, { compact: false, depth: undefined, sorted: false })
}

interface NormalizedOptions extends EslintConfigGeneratorSchema {
  configureConfigExpressions: string[]
  configureOptions: NonNullable<EslintConfigGeneratorSchema['configureOptions']>
  dependencyChecksIgnore: string[]
  dependencyChecksRuntime: string[]
  moduleBoundaries: NonNullable<EslintConfigGeneratorSchema['moduleBoundaries']>
}

export default eslintConfigGenerator
