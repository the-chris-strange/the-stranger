import { joinPathFragments, readProjectConfiguration, Tree } from '@nx/devkit'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { TSConfig } from '../../lib/tsconfig'
import { TSConfigSchema } from './schema'

export async function tsconfigGenerator(tree: Tree, options: TSConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)
  const { projectType = 'library' } = project

  options.fileName ??= `tsconfig.${projectType.slice(0, 3)}.json`
  if (!options.fileName.endsWith('.json')) {
    options.fileName += '.json'
  }

  options.tscOptions ??= {}
  options.tscOptions.overwriteStrategy ??= owStrategy(options.force)

  const tsconfig = new TSConfig(
    tree,
    joinPathFragments(project.root, options.fileName),
    options.tscOptions,
  )

  if (options.compilerOptions) {
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      ...options.compilerOptions,
    }
  }

  if (options.exclude) {
    tsconfig.exclude = options.exclude
  }

  if (options.extends) {
    tsconfig.extends = options.extends
  }

  if (options.files) {
    tsconfig.files = options.files
  }

  if (options.include) {
    tsconfig.include = options.include
  }

  if (options.references) {
    tsconfig.references = options.references
  }

  tsconfig.write()

  await formatFiles(tree, options)
}

export type TSCGenerator = (tree: Tree, options: TSCGeneratorOptions) => void

export interface TSCGeneratorOptions {
  rootConfig?: string
  compilerOutput?: string
  baseConfig?: string
  sourceConfig: string
  testConfig?: string
  projectRoot: string
}

export default tsconfigGenerator
