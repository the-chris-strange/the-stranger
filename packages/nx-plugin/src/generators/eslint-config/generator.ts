import path from 'node:path'

import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit'

import { findExisting } from '../../lib/find-existing'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addEslintDependencies } from './dependencies'
import { FILE_EXTENSIONS, findFileExtension } from './file-extensions'
import { DependencyCheckOptions, ESLintConfigSchema } from './schema'

/**
 * Generate an ESLint configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function eslintConfigGenerator(tree: Tree, options: ESLintConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)

  const configFileNames = FILE_EXTENSIONS.map(e => `eslint.config.${e}`)

  const baseConfig = options.extend ?? findExisting(tree, ...configFileNames)
  if (baseConfig === undefined) {
    throw new Error('Unable to locate a base configuration file to extend.')
  }
  const fileExtension = findFileExtension(options, baseConfig)

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
    resolveDependencyChecksOptions(options),
  )
  const data = { dependencyChecksOptions, options, paths }

  generateFiles(
    tree,
    path.join(__dirname, 'files', fileExtension),
    project.root,
    data,
    { overwriteStrategy: owStrategy(options.force) },
  )

  await formatFiles(tree, options)
}

function resolveDependencyChecksOptions(options: ESLintConfigSchema) {
  const {
    buildTargets,
    checkMissingDependencies,
    checkObsoleteDependencies,
    checkVersionMismatches = false,
    ignoredDependencies,
    ignoredFiles = [],
    includeTransitiveDependencies,
    useLocalPathsForWorkspaceDependencies,
  } = options

  const ruleOptions: DependencyCheckOptions = {
    buildTargets,
    checkMissingDependencies,
    checkObsoleteDependencies,
    checkVersionMismatches,
    ignoredDependencies,
    ignoredFiles: [
      '{projectRoot}/eslint.config.{ts,js,cjs,mjs}',
      '{projectRoot}/vite.config.{ts,js,mjs,mts}',
      ...ignoredFiles,
    ],
    includeTransitiveDependencies,
    useLocalPathsForWorkspaceDependencies,
  }

  return ruleOptions
}

export default eslintConfigGenerator
