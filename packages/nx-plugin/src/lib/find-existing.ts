import { Tree } from '@nx/devkit'

/**
 * Find the first file that exists from a list of possible file paths.
 * @param tree the NX virtual file system
 * @param paths an array of possible paths
 * @returns the first file found
 */
export function findExisting(tree: Tree, ...paths: string[]) {
  for (const p of paths) {
    if (tree.exists(p)) {
      return p
    }
  }
  return
}
