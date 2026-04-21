import { joinPathFragments, readProjectConfiguration, type Tree } from '@nx/devkit'
import { libraryGenerator as nxLibraryGenerator } from '@nx/js'

import type { LibrarySchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { cspellConfigGenerator } from '../cspell-config/generator'
import { eslintConfigGenerator } from '../eslint-config/generator'
import { jestConfigGenerator } from '../jest-config/generator'
import { viteConfigGenerator } from '../vite-config/generator'
import { addDependencies } from './dependencies'
import { updateManifest } from './manifest'
import { normalizeOptions } from './options'

/**
 * Generate a new library in the `packages` directory with the given name, along with ESLint and CSpell configurations and a test configuration for the specified test runner.
 * @param tree the NX virtual file system
 * @param options configuration options
 */
export async function libraryGenerator(tree: Tree, options: LibrarySchema) {
  const config = normalizeOptions(options)
  const force = config.force !== false
  const project = config.name

  await nxLibraryGenerator(tree, {
    bundler: config.bundler,
    directory: joinPathFragments('packages', config.name),
    linter: config.skipEslint ? 'none' : 'eslint',
    name: config.name,
    testEnvironment: config.testEnvironment,
    unitTestRunner: config.unitTestRunner,
  })

  const projectConfig = readProjectConfiguration(tree, config.name)

  if (!config.skipEslint) {
    await eslintConfigGenerator(tree, {
      force,
      project,
      skipDependencies: config.skipDependencies,
      skipFormat: true,
    })
  }

  if (!config.skipCspell) {
    await cspellConfigGenerator(tree, {
      force,
      project,
      skipDependencies: config.skipDependencies,
      skipFormat: true,
    })
  }

  if (!config.skipTestConfig) {
    if (config.bundler === 'vite' || config.unitTestRunner === 'vitest') {
      await viteConfigGenerator(tree, {
        force,
        globals: config.globals,
        includeBuild: config.bundler === 'vite',
        includeTest: config.unitTestRunner === 'vitest',
        project,
        react: config.react,
        rollupExternals: config.rollupExternals,
        skipFormat: true,
        swc: config.swc,
        testEnvironment: config.testEnvironment,
        tsconfigName: 'tsconfig.lib.json',
      })
    }

    if (config.unitTestRunner === 'jest') {
      await jestConfigGenerator(tree, {
        force,
        globals: config.globals,
        project,
        skipDependencies: config.skipDependencies,
        skipFormat: true,
        testEnvironment: config.testEnvironment,
      })
    }
  }

  if (!options.skipDependencies) {
    addDependencies(tree, { ...config, directory: projectConfig.root })
  }

  updateManifest(tree, config, projectConfig)

  await formatFiles(tree, options)
}

export default libraryGenerator
