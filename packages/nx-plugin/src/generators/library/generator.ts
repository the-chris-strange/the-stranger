import { type Tree, joinPathFragments, readProjectConfiguration } from '@nx/devkit'
import { libraryGenerator as nxLibraryGenerator } from '@nx/js'

import type { LibrarySchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { cspellConfigGenerator } from '../cspell-config/generator'
import { eslintConfigGenerator } from '../eslint-config/generator'
import { jestConfigGenerator } from '../jest-config/generator'
import { viteConfigGenerator } from '../vite-config/generator'
import { vitestConfigGenerator } from '../vitest-config/generator'
import { addDependencies } from './dependencies'
import { updateManifest } from './manifest'

/**
 * Generate a new library in the `packages` directory with the given name, along with ESLint and CSpell configurations and a test configuration for the specified test runner.
 * @param tree the NX virtual file system
 * @param options configuration options
 */
export async function libraryGenerator(tree: Tree, options: LibrarySchema) {
  const force = options.force !== false
  const {
    bundler = 'tsc',
    name: project,
    react,
    rollupExternals,
    skipCspell,
    skipDependencies,
    skipEslint,
    swc,
    testEnvironment,
    unitTestRunner,
  } = options

  await nxLibraryGenerator(tree, {
    bundler: bundler === 'vite' ? 'none' : bundler,
    directory: joinPathFragments('packages', project),
    linter: 'none',
    name: project,
    unitTestRunner: 'none',
  })

  const projectConfig = readProjectConfiguration(tree, project)

  if (bundler === 'vite') {
    await viteConfigGenerator(tree, {
      force,
      project,
      react,
      rollupExternals,
      skipDependencies,
      skipFormat: true,
      swc,
    })
  }

  if (unitTestRunner === 'vitest') {
    await vitestConfigGenerator(tree, {
      force,
      globals: options.globals,
      project,
      skipDependencies,
      skipFormat: true,
      testEnvironment,
    })
  } else if (unitTestRunner === 'jest') {
    await jestConfigGenerator(tree, {
      force,
      globals: options.globals,
      project,
      skipDependencies,
      skipFormat: true,
      testEnvironment,
    })
  }

  if (!skipEslint) {
    await eslintConfigGenerator(tree, {
      force,
      project,
      skipDependencies,
      skipFormat: true,
    })
  }

  if (!skipCspell) {
    await cspellConfigGenerator(tree, {
      force,
      project,
      skipDependencies,
      skipFormat: true,
    })
  }

  if (!options.skipDependencies) {
    addDependencies(tree, { ...options, directory: projectConfig.root })
  }

  updateManifest(tree, options, projectConfig)

  await formatFiles(tree, options)
}

export default libraryGenerator
