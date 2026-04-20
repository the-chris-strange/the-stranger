import path from 'node:path'

import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit'

import type { CSpellConfigSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'

/**
 * Generate a [CSpell](https://cspell.org/) configuration file for a project.
 * @param tree the NX virtual file system
 * @param options configuration options
 */
export async function cspellConfigGenerator(tree: Tree, options: CSpellConfigSchema) {
  const files = path.join(__dirname, 'files')

  const overwriteStrategy = owStrategy(options?.force ?? false)

  const project = readProjectConfiguration(tree, options.project)
  const offset = offsetFromRoot(project.root)
  const data = {
    paths: { rootConfig: joinPathFragments(offset, 'cspell.config.yaml') },
  }
  generateFiles(tree, files, project.root, data, { overwriteStrategy })

  await formatFiles(tree, options)
}

export default cspellConfigGenerator
