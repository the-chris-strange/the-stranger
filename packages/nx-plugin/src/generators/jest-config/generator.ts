import path from 'node:path'

import {
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { JestConfigSchema } from './schema'

import { findExisting } from '../../lib/find-existing'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { TSConfig } from '../../lib/tsconfig'
import { addDependencies } from './dependencies'

/**
 * Generate a jest configuration file for a project.
 * @param tree the NX virtual files system
 * @param options generator options, including the project name
 */
export async function jestConfigGenerator(tree: Tree, options: JestConfigSchema) {
  options.testEnvironment ??= 'node'
  options.globals ??= false

  const projectConfig = readProjectConfiguration(tree, options.project)

  const tsconfigPath = joinPathFragments(projectConfig.root, 'tsconfig.spec.json')
  const tsconfig = new TSConfig(tsconfigPath, tree, {
    overwriteStrategy: owStrategy(options.force),
  })
  if (options.globals === false) {
    tsconfig.removeTypes('jest')
    tsconfig.write()
  }

  const offset = offsetFromRoot(projectConfig.root)
  const presets = ['js', 'cjs'].map(ext => `jest.preset.${ext}`)
  const jestPreset = findExisting(tree, ...presets)
  const templateData = {
    ...options,
    paths: {
      coverageDirectory: joinPathFragments(
        offset,
        'quality-reports/packages',
        projectConfig.name!,
      ),
      jestPreset: jestPreset ? joinPathFragments(offset, jestPreset) : undefined,
    },
  }

  generateFiles(tree, path.join(__dirname, 'files'), projectConfig.root, templateData, {
    overwriteStrategy: owStrategy(options.force),
  })

  if (!options.skipDependencies) {
    addDependencies(
      tree,
      options,
      joinPathFragments(projectConfig.root, 'package.json'),
    )
  }

  await formatFiles(tree, options)
}

export default jestConfigGenerator
