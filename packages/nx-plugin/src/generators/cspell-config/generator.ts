import path from 'node:path'

import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { CspellConfigSchema } from './schema'

export async function cspellConfigGenerator(tree: Tree, options: CspellConfigSchema) {
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
