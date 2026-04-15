import { join } from 'node:path'

import { ProjectConfiguration, readProjectConfiguration, Tree } from '@nx/devkit'
import { PackageJson } from 'nx/src/utils/package-json'
import sortPackageJson from 'sort-package-json'

import { readJson, writeJson } from '../../lib/json'
import { LibrarySchema } from './schema'

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
