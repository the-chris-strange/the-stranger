import { join } from 'node:path'

import {
  ProjectConfiguration,
  readJson,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit'
import { PackageJson } from 'nx/src/utils/package-json'

import { TSLibrarySchema } from './schema'

/**
 * Update the project's manifest (package.json) with the configured type and exports.
 * @param tree the NX virtual file system
 * @param config the generator config
 * @param project the NX project configuration
 */
export function updateManifest(
  tree: Tree,
  config: TSLibrarySchema,
  project?: ProjectConfiguration,
) {
  project ??= readProjectConfiguration(tree, config.name)

  const manifestPath = join(project.root, 'package.json')
  const manifest = readJson<PackageJson>(tree, manifestPath)

  if (config.commonjs) {
    manifest.type = 'commonjs'
  } else {
    manifest.type = 'module'
    const mainExport: PackageJsonExports = {
      import: manifest.main ?? './src/index.js',
      types: manifest.types ?? './src/index.d.ts',
    }
    manifest.exports = {
      '.': mainExport,
      './package.json': './package.json',
    }
    delete manifest.main
    delete manifest.types
  }

  writeJson(tree, manifestPath, manifest)
}

interface PackageJsonExports {
  types?: string
  require?: string
  import?: string
  development?: string
  default?: string
}
