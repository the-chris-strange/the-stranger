import path from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { markerFiles } from '../../lib/config-marker-files'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addDependencies } from './dependencies'
import { normalizeOptions } from './options'
import { generateTsc } from './tsconfig'

/**
 * Generate Vitest configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function vitestConfigGenerator(tree: Tree, options: VitestConfigSchema) {
  if (options.includeTest === false) {
    const project = readProjectConfiguration(tree, options.project)
    const markers = markerFiles.vitest
      .filter(e => !(markerFiles.vite as readonly string[]).includes(e))
      .map(e => joinPathFragments(project.root, e))
    removeAll(tree, ...markers)
    await formatFiles(tree, options)
    return
  }

  const project = readProjectConfiguration(tree, options.project)
  const config = normalizeOptions(tree, { ...options, includeTest: true })
  const offset = offsetFromRoot(project.root)
  const paths = {
    coverage: joinPathFragments(offset, options.coveragePath ?? '.reports/coverage', project.root),
    testReports: joinPathFragments(offset, config.testReportPath, project.root),
    vitestCache: joinPathFragments(offset, 'node_modules/.vitest', project.root),
  }

  if (!config.skipTsconfigs) {
    generateTsc(tree, config)
  }

  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    project.root,
    { ...config, paths, projectRoot: project.root },
    { overwriteStrategy: owStrategy(options.force) },
  )

  if (!config.skipDependencies) {
    addDependencies(tree, config, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, config)
}

export default vitestConfigGenerator
