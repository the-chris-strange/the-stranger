import path from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { addDependencies } from './dependencies'
import { generateTsc } from './tsconfig'

/**
 * Generate Vitest configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function vitestConfigGenerator(tree: Tree, options: VitestConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)
  const {
    coverageProvider = 'v8',
    globals = false,
    skipDependencies,
    skipTsconfigs,
    testEnvironment = 'node',
  } = options
  const offset = offsetFromRoot(project.root)
  const coveragePath = joinPathFragments(
    offset,
    options.coveragePath ?? '.reports/coverage',
    project.root,
  )

  if (!skipTsconfigs) {
    generateTsc(tree, options)
  }

  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    project.root,
    {
      coveragePath,
      coverageProvider,
      globals,
      project: options.project,
      projectPath: path.dirname(project.root),
      testEnvironment,
    },
    { overwriteStrategy: owStrategy(options.force) },
  )

  if (!skipDependencies) {
    addDependencies(tree, options, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, options)
}

export default vitestConfigGenerator
