import { join } from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { ViteConfigSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { addDependencies } from './dependencies'
import { generateTsc } from './tsconfig'

/**
 * Generate Vite configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function viteConfigGenerator(tree: Tree, options: ViteConfigSchema) {
  const {
    ext = 'mts',
    formats = ['es'],
    project: projectName,
    react = false,
    rollupExternals,
    target,
    worker,
  } = options

  const project = readProjectConfiguration(tree, projectName)
  const offset = offsetFromRoot(project.root)
  const paths = {
    buildOutput: joinPathFragments(offset, 'dist', project.root),
    reactPlugin: options.swc ? 'vite-plugin-react-swc' : 'vite-plugin-react',
    viteCache: joinPathFragments(offset, 'node_modules/.vite', project.root),
  }

  if (!options.skipTsconfigs) {
    generateTsc(tree, options)
  }

  const data = {
    ext,
    formats,
    paths,
    projectName,
    projectType: project.projectType,
    react,
    rollupExternals,
    target,
    tsconfigExt: project.projectType?.slice(0, 3),
    worker,
  }
  generateFiles(tree, join(__dirname, 'files'), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })

  if (!options.skipDependencies) {
    addDependencies(tree, options, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, options)
}

export default viteConfigGenerator
