import { join } from 'node:path'

import { type Tree, generateFiles } from '@nx/devkit'

import type { NormalizedOptions } from './options'

import { owStrategy } from '../../lib/overwrite-strategy'
import { removeAll } from '../../lib/remove-all'
import { addEslintDependencies } from './dependencies'

export function generateWorkspaceConfig(tree: Tree, options: NormalizedOptions) {
  if (!options.skipDependencies) {
    addEslintDependencies(tree, { root: '.' })
  }

  removeAll(tree, 'eslint.config.cjs', 'eslint.config.ts')

  const data = {
    additionalConfigs: options.additionalConfigs.map(config =>
      typeof config === 'string' ? config : serialize(config),
    ),
    configureOptions: serialize(options.configureOptions),
  }

  generateFiles(tree, join(__dirname, 'files', 'workspace'), '.', data, {
    overwriteStrategy: owStrategy(options.force),
  })
}

function serialize(value: object) {
  return JSON.stringify(value, undefined, 2)
}
