import type { Tree } from '@nx/devkit'

import type { ESLintConfigSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { normalizeOptions } from './options'
import { generateProjectConfig } from './project-config'
import { generateWorkspaceConfig } from './workspace-config'

/**
 * Generate an ESLint configuration file.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function eslintConfigGenerator(tree: Tree, options: ESLintConfigSchema) {
  const config = normalizeOptions(options)

  if (config.configType === 'project') {
    generateProjectConfig(tree, config)
  } else {
    generateWorkspaceConfig(tree, config)
  }

  await formatFiles(tree, options)
}

export default eslintConfigGenerator
