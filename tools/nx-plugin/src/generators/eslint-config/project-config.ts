import { join } from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'
import { dependencyChecks } from '@the-stranger/eslint-config/nx'
import { owStrategy } from '@the-stranger/nx-plugin'

import type { NormalizedOptions } from './options'

export function generateProjectConfig(tree: Tree, options: NormalizedOptions) {
  if (options.project === undefined) {
    throw new Error('Project config generation requires a project name')
  }

  const project = readProjectConfiguration(tree, options.project)
  const baseConfig =
    options.extend ??
    joinPathFragments(offsetFromRoot(project.root), 'eslint.config.mjs')

  const data = {
    dependencyChecks: dependencyChecks(),
    paths: { baseConfig },
  }

  generateFiles(tree, join(__dirname, 'files', 'project'), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })
}
