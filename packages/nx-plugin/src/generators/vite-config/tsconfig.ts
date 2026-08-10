import { basename, join } from 'node:path'

import {
  type Tree,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { ViteConfigSchema } from './schema'

import { type TSConfigOptions, TSConfig } from '../../lib/tsconfig'

export function generateTsc(tree: Tree, options: ViteConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)
  const offset = offsetFromRoot(project.root)
  const buildConfigName = `tsconfig.${project.projectType?.slice(0, 3)}.json`

  const tscOptions: TSConfigOptions = { overwriteStrategy: options.force !== false }

  const baseConfig = new TSConfig(join(project.root, 'tsconfig.json'), tree, tscOptions)

  const buildConfig = new TSConfig(
    join(project.root, buildConfigName),
    tree,
    tscOptions,
  )

  if (baseConfig.config.compilerOptions.module) {
    delete baseConfig.config.compilerOptions.module
  }

  buildConfig.config.compilerOptions.tsBuildInfoFile ??= joinPathFragments(
    offset,
    'out-tsc',
    project.root,
    `${basename(buildConfigName, '.json')}.tsbuildinfo`,
  )

  baseConfig.addReferences(`./${buildConfigName}`)
  baseConfig.config.compilerOptions = {}

  delete buildConfig.config.compilerOptions.declaration
  buildConfig.config.compilerOptions.outDir ??= joinPathFragments(
    offset,
    'dist/out-tsc',
  )

  if (options.target?.every(e => e.includes('node'))) {
    buildConfig.removeTypes('vite/client')
  }

  if (options.react) {
    buildConfig.config.include.push('src/**/*.tsx')
  }

  baseConfig.write()
  buildConfig.write()
}
