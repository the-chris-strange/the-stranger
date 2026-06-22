import { join } from 'node:path'

import {
  type ProjectConfiguration,
  type Tree,
  readProjectConfiguration,
} from '@nx/devkit'
import sortPackageJson from 'sort-package-json'

import type { PackageJson } from 'nx/src/utils/package-json'

import type { LibrarySchema } from './schema'

import { readJson, writeJson } from '../../lib/json'

/**
 * Update the project's manifest (package.json) with the configured type and exports.
 * @param tree the NX virtual file system
 * @param config the generator config
 * @param project the NX project configuration
 */
export function updateManifest(
  tree: Tree,
  config: LibrarySchema,
  project?: ProjectConfiguration,
) {
  project ??= readProjectConfiguration(tree, config.name)

  const manifestPath = join(project.root, 'package.json')
  const manifest = readJson<PackageJson>(manifestPath, tree)

  if (config.commonjs) {
    manifest.type = 'commonjs'
  } else {
    manifest.type = 'module'
    manifest.exports = {
      '.': {
        import: manifest.main ?? './src/index.js',
        types: manifest.types ?? './src/index.d.ts',
      },
      './package.json': './package.json',
    }
  }

  writeJson(manifestPath, sortPackageJson(manifest), tree)
}
