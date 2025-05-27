import { joinPathFragments, Tree } from '@nx/devkit'
import { libraryGenerator } from '@nx/js'

import { formatFiles } from '../../lib/format-files'
import { cspellConfigGenerator } from '../cspell-config/generator'
import { eslintConfigGenerator } from '../eslint-config/generator'
import { jestConfigGenerator } from '../jest-config/generator'
import { JestConfigSchema } from '../jest-config/schema'
import { viteConfigGenerator } from '../vite-config/generator'
import { ViteConfigSchema } from '../vite-config/schema'
import { TSLibrarySchema } from './schema'

export function extractCspellOptions(options: TSLibrarySchema) {
  const { force, forceCspell } = options
  return { ...extractInternalOptions(options), force: forceCspell ?? force }
}

export function extractEslintOptions(options: TSLibrarySchema) {
  const { force, forceEslint } = options
  return { ...extractInternalOptions(options), force: forceEslint ?? force }
}

export function extractInternalOptions(options: TSLibrarySchema) {
  const { name: project, skipDependencies } = options
  return { project, skipDependencies, skipFormat: true }
}

export function extractJestOptions(options: TSLibrarySchema): JestConfigSchema {
  const { force, forceJest, globals, testEnvironment } = options
  return {
    ...extractInternalOptions(options),
    force: forceJest ?? force,
    globals,
    testEnvironment,
  }
}

export function extractViteOptions(options: TSLibrarySchema): ViteConfigSchema {
  const {
    bundler = 'vite',
    force,
    forceVite,
    globals,
    react,
    rollupExternals,
    swc,
    testEnvironment,
    unitTestRunner = 'vitest',
  } = options
  return {
    ...extractInternalOptions(options),
    force: forceVite ?? force,
    globals,
    includeBuild: bundler === 'vite',
    includeTest: unitTestRunner === 'vitest',
    react,
    rollupExternals,
    swc,
    testEnvironment,
    tsconfigName: 'tsconfig.lib.json',
  }
}

export async function tsLibraryGenerator(tree: Tree, options: TSLibrarySchema) {
  const {
    bundler = 'vite',
    name,
    skipCspell = false,
    skipEslint = false,
    testEnvironment = 'node',
    unitTestRunner = 'vitest',
  } = options

  // run the official NX library generator first
  await libraryGenerator(tree, {
    bundler,
    directory: joinPathFragments('packages', name),
    linter: 'eslint',
    name,
    testEnvironment,
    unitTestRunner,
  })

  if (!skipEslint) {
    await eslintConfigGenerator(tree, extractEslintOptions(options))
  }

  if (!skipCspell) {
    await cspellConfigGenerator(tree, extractCspellOptions(options))
  }

  if (!options.skipTestConfig && (bundler === 'vite' || unitTestRunner === 'vitest')) {
    await viteConfigGenerator(tree, extractViteOptions(options))
  }

  if (!options.skipTestConfig && unitTestRunner === 'jest') {
    await jestConfigGenerator(tree, extractJestOptions(options))
  }

  await formatFiles(tree, options)
}

export const requiredDependencies = [
  '@nx/eslint',
  '@nx/eslint-plugin',
  '@nx/js',
  '@nx/vite',
  '@types/node',
  '@typescript-eslint/parser',
  '@typescript-eslint/utils',
  '@vitest/coverage-v8',
  '@vitest/eslint-plugin',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-jsdoc',
  'eslint-plugin-perfectionist',
  'eslint-plugin-unicorn',
  'jsonc-eslint-parser',
  'nx',
  'prettier',
  'prettier-plugin-packagejson',
  'tslib',
  'typescript',
  'typescript-eslint',
  'vite',
  'vitest',
]

export default tsLibraryGenerator
