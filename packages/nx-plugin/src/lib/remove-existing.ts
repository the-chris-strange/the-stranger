import { Tree } from '@nx/devkit'

import { findExisting } from './find-existing'

/**
 * Find the first file that exists from a list of possible file paths and delete it.
 * @param tree the NX virtual file system
 * @param paths an array of possible paths
 * @returns true if a file was found and deleted; otherwise, false
 */
export function removeExisting(tree: Tree, ...paths: string[]) {
  const existing = findExisting(tree, ...paths)
  if (existing) {
    tree.delete(existing)
    return true
  }
  return false
}
