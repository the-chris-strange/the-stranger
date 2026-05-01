import path from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { ViteConfigSchema } from './schema'

import { markerFiles } from '../../lib/config-marker-files'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addDependencies } from './dependencies'
import { normalizeOptions } from './options'
import { generateTsc } from './tsconfig'

/**
 * Generate Vite configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function viteConfigGenerator(tree: Tree, options: ViteConfigSchema) {
  if (options.includeBuild === undefined && options.includeTest === undefined) {
    return
  }

  const project = readProjectConfiguration(tree, options.project)

  if (!(options.includeBuild || options.includeTest)) {
    const markers = [...markerFiles.vite, ...markerFiles.vitest].map(e =>
      joinPathFragments(project.root, e),
    )
    removeAll(tree, ...markers)
    await formatFiles(tree, options)
    return
  }

  const config = normalizeOptions(tree, options)

  const offset = offsetFromRoot(project.root)
  const paths = {
    buildOutput: joinPathFragments(offset, 'dist', project.root),
    coverage: joinPathFragments(offset, 'coverage', project.root),
    defineConfig: config.includeTest ? 'vitest/config' : 'vite',
    reactPlugin: config.swc ? 'vite-plugin-react-swc' : 'vite-plugin-react',
    testReports: joinPathFragments(offset, config.testReportPath, project.root),
    viteCache: joinPathFragments(offset, 'node_modules/.vite', project.root),
  }

  if (!config.skipTsconfigs) {
    generateTsc(tree, config)
  }

  const data = { ...config, paths }
  generateFiles(tree, path.join(__dirname, 'files'), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })

  if (!config.skipDependencies) {
    addDependencies(tree, config, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, config)
}

export default viteConfigGenerator
