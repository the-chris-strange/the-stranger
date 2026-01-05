import { existsSync } from 'node:fs'

import { Tree } from '@nx/devkit'

/**
 * Check if a file exists, either in the NX virtual filesystem {@link Tree}, or in the actual file system.
 * @param path the path to a file
 * @param tree the NX virtual file system
 * @returns true if the file exists; false otherwise
 */
export function exists(path: string, tree?: Tree) {
  if (tree) {
    return tree.exists(path)
  }
  return existsSync(path)
}
