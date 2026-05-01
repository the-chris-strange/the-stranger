import { type Tree, joinPathFragments } from '@nx/devkit'

import { markerFiles } from './config-marker-files'
import { findExisting } from './find-existing'

/**
 * Detect whether a project uses a library or tool by looking for specific config files.
 * @param tree the NX virtual file system
 * @param config the type of configuration to detect
 * @param prefix the path prefix for the configuration file
 * @returns true if the configuration file exists
 */
export function detectConfig(tree: Tree, config: ConfigTypes, prefix?: string) {
  const files = markerFiles[config].map(e =>
    prefix ? joinPathFragments(prefix, e) : e,
  )
  return findExisting(tree, ...files) !== undefined
}

export type ConfigTypes = keyof typeof markerFiles
