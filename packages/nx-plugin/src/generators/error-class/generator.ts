import path from 'node:path'

import { generateFiles, joinPathFragments, names, Tree } from '@nx/devkit'

import { addPeriod } from '../../lib/add-period'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { ErrorClassSchema } from './schema'

export async function errorClassGenerator(tree: Tree, options: ErrorClassSchema) {
  const extended = options.extend ?? 'Error'
  const data = {
    ...names(options.name),
    description: addPeriod(options.description ?? `Emit a custom ${extended}.`),
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
