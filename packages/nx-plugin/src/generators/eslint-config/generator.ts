import path from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { DependencyCheckOptions, ESLintConfigSchema } from './schema'

import { detectConfig } from '../../lib/detect-config'
import { findExisting } from '../../lib/find-existing'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addEslintDependencies } from './dependencies'

/**
 * Possible file extensions for eslint.config, in order of precedence.
 */
export const FILE_EXTENSIONS = ['ts', 'mjs', 'cjs'] as const

/**
 * Generate an ESLint configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function eslintConfigGenerator(tree: Tree, options: ESLintConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)

  const baseConfig =
    options.extend ??
    findExisting(tree, ...FILE_EXTENSIONS.map(e => `eslint.config.${e}`))

  if (baseConfig === undefined) {
    throw new Error('Unable to locate a base configuration file to extend.')
  }

  const {
    fileExtension = path.extname(baseConfig).slice(1) as NonNullable<
      ESLintConfigSchema['fileExtension']
    >,
  } = options

  if (!FILE_EXTENSIONS.includes(fileExtension)) {
    throw new Error(`Base config (${baseConfig}) has an invalid file extension.`)
  }

  removeAll(
    tree,
    ...FILE_EXTENSIONS.filter(e => e !== fileExtension).map(e =>
      joinPathFragments(project.root, `eslint.config.${e}`),
    ),
  )

  if (!options.skipDependencies) {
    addEslintDependencies(tree, { ...project, unitTestRunner: options.unitTestRunner })
  }

  const offset = offsetFromRoot(project.root)
  const paths = { baseConfig: joinPathFragments(offset, baseConfig) }
  const dependencyChecksOptions = JSON.stringify(
    resolveDependencyChecksOptions(tree, options),
  )
  const data = { dependencyChecksOptions, fileExtension, options, paths }
  const sourceFolder = fileExtension === 'cjs' ? 'cjs' : 'esm'

  generateFiles(tree, path.join(__dirname, 'files', sourceFolder), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })

  await formatFiles(tree, options)
}

function resolveDependencyChecksOptions(tree: Tree, options: ESLintConfigSchema) {
  const {
    buildTargets,
    checkMissingDependencies,
    checkObsoleteDependencies,
    checkVersionMismatches = false,
    extraIgnoredFiles = [],
    ignoredDependencies,
    ignoredFiles = [
      '{projectRoot}/eslint.config.{ts,js,cjs,mjs}',
      '{projectRoot}/src/**/*.spec.{ts,js,tsx,jsx}',
    ],
    includeTransitiveDependencies,
    useLocalPathsForWorkspaceDependencies,
  } = options

  if (detectConfig(tree, 'vitest')) {
    ignoredFiles.push(
      '{projectRoot}/vite.config.{js,ts,mjs,mts}',
      '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
    )
  }

  const ruleOptions: DependencyCheckOptions = {
    buildTargets,
    checkMissingDependencies,
    checkObsoleteDependencies,
    checkVersionMismatches,
    ignoredDependencies,
    ignoredFiles: [...ignoredFiles, ...extraIgnoredFiles],
    includeTransitiveDependencies,
    useLocalPathsForWorkspaceDependencies,
  }

  return ruleOptions
}

export default eslintConfigGenerator
