import path from 'node:path'

import { type Tree, generateFiles, joinPathFragments, names } from '@nx/devkit'

import type { ErrorClassSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'

/**
 * Generate a custom error class.
 * @param tree the NX virtual file system
 * @param options configuration options
 */
export async function errorClassGenerator(tree: Tree, options: ErrorClassSchema) {
  const extended = options.extend ?? 'Error'
  const { description = `Emit a custom ${extended}.` } = options
  const data = {
    ...names(options.name),
    description: description.endsWith('.') ? description : `${description}.`,
    extended,
  }

  generateFiles(tree, path.join(__dirname, 'files'), options.directory, data, {
    overwriteStrategy: owStrategy(options.force),
  })

  if (options.skipTests) {
    tree.delete(joinPathFragments(options.directory, `${data.fileName}.spec.ts`))
  }

  await formatFiles(tree, options)
}

export default errorClassGenerator
