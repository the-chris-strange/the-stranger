import { join } from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { NormalizedOptions } from './options'
import type { DependencyCheckOptions } from './schema'

import { detectConfig } from '../../lib/detect-config'
import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addEslintDependencies } from './dependencies'

export function generateProjectConfig(tree: Tree, options: NormalizedOptions) {
  if (!options.project) {
    throw new Error('Project config generation requires a project name.')
  }

  const project = readProjectConfiguration(tree, options.project)

  if (!options.skipDependencies) {
    addEslintDependencies(tree, project)
  }

  removeAll(
    tree,
    joinPathFragments(project.root, 'eslint.config.cjs'),
    joinPathFragments(project.root, 'eslint.config.ts'),
  )

  const baseConfig =
    options.extend ??
    joinPathFragments(offsetFromRoot(project.root), 'eslint.config.mjs')
  const dependencyChecksOptions = JSON.stringify(
    resolveDependencyChecksOptions(tree, options, project.root),
    undefined,
    2,
  )

  generateFiles(
    tree,
    join(__dirname, 'files', 'project'),
    project.root,
    { dependencyChecksOptions, paths: { baseConfig } },
    { overwriteStrategy: owStrategy(options.force) },
  )
}

function resolveDependencyChecksOptions(
  tree: Tree,
  options: NormalizedOptions,
  projectRoot: string,
) {
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

  if (detectConfig(tree, 'vitest') || detectConfig(tree, 'vitest', projectRoot)) {
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
