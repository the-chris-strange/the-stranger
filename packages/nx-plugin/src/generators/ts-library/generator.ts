import { joinPathFragments, readProjectConfiguration, Tree } from '@nx/devkit'
import { libraryGenerator } from '@nx/js'

import { formatFiles } from '../../lib/format-files'
import { cspellConfigGenerator } from '../cspell-config/generator'
import { eslintConfigGenerator } from '../eslint-config/generator'
import { jestConfigGenerator } from '../jest-config/generator'
import { viteConfigGenerator } from '../vite-config/generator'
import { addLibDependencies } from './dependencies'
import { updateManifest } from './manifest'
import { normalizeOptions } from './options'
import { TSLibrarySchema } from './schema'

export async function tsLibraryGenerator(tree: Tree, options: TSLibrarySchema) {
  const config = normalizeOptions(options)
  const force = config.force !== false
  const project = config.name

  await libraryGenerator(tree, {
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
    addLibDependencies(tree, { ...config, directory: projectConfig.root })
  }

  updateManifest(tree, config, projectConfig)

  await formatFiles(tree, options)
}

export default tsLibraryGenerator
