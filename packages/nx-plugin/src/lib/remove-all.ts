import { Tree } from '@nx/devkit'

/**
 * Remove all of the specified files from the file system.
 * @param tree the NX virtual file system
 * @param names the names of the files to remove
 */
export function removeAll(tree: Tree, ...names: string[]) {
  for (const name of names) {
    if (tree.exists(name)) {
      tree.delete(name)
    }
  }
}
