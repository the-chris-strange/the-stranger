import { join } from 'node:path'

import { type Tree, readProjectConfiguration } from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { type TSConfigOptions, TSConfig } from '../../lib/tsconfig'

export function generateTsc(tree: Tree, options: VitestConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)

  const tscOptions: TSConfigOptions = { overwriteStrategy: options.force !== false }

  const baseConfig = new TSConfig(join(project.root, 'tsconfig.json'), tree, tscOptions)

  const testConfig = new TSConfig(
    join(project.root, 'tsconfig.spec.json'),
    tree,
    tscOptions,
  )

  baseConfig.addReferences('./tsconfig.spec.json')
  testConfig.addReferences(`./tsconfig.${project.projectType?.slice(0, 3)}.json`)

  if (!options.globals) {
    testConfig.removeTypes('vitest/globals')
  }

  baseConfig.write()
  testConfig.write()
}
