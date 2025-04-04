import path from 'node:path'

import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit'

import { findExisting } from '../../lib/find-existing'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { TSConfig } from '../../lib/tsconfig'
import { JestConfigSchema } from './schema'

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
  const tsconfig = new TSConfig(tree, tsconfigPath, {
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
        projectConfig.name as string,
      ),
      jestPreset: jestPreset ? joinPathFragments(offset, jestPreset) : undefined,
    },
  }

  generateFiles(tree, path.join(__dirname, 'files'), projectConfig.root, templateData, {
    overwriteStrategy: owStrategy(options.force),
  })

  await formatFiles(tree, options)
}

export default jestConfigGenerator
