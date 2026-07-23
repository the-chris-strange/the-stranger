import { type Tree, formatFiles as nxFormatFiles } from '@nx/devkit'

import type { GeneratorSchema } from './generator-schema'

/**
 * If the `skipFormat` option is false, format files generated in the tree; otherwise, no-op.
 * @param tree the NX virtual file system
 * @param options an options object
 */
export async function formatFiles(tree: Tree, options?: FormatFilesOptions) {
  if (options?.skipFormat === false) {
    await nxFormatFiles(tree, options)
  }
}

export type FormatFilesOptions = Parameters<typeof nxFormatFiles>[1] &
  Pick<GeneratorSchema, 'skipFormat'>
