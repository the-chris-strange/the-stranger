import path from 'node:path'

import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { ErrorClassSchema } from './schema'

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
