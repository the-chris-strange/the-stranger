import { formatFiles } from '@the-stranger/nx-plugin'

import type { Tree } from '@nx/devkit'

import type { EslintConfigSchema } from './schema'

import { normalizeOptions } from './options'
import { generateRootConfig } from './root-config'

export async function eslintConfigGenerator(tree: Tree, options: EslintConfigSchema) {
  const config = normalizeOptions(options)

  if (config.project) {
    const { generateProjectConfig } = await import('./project-config.js')
    generateProjectConfig(tree, config)
  } else {
    generateRootConfig(tree, config)
  }

  await formatFiles(tree, options)
}

export default eslintConfigGenerator
