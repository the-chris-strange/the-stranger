import { Tree } from '@nx/devkit'

import { TSConfig, TSConfigOptions } from '../../lib/tsconfig'
import { NormalizedSchema } from './options'

export function generateTsc(tree: Tree, options: NormalizedSchema) {
  const { names, outDir, target, tsBuildInfo } = options
  const tscOptions: TSConfigOptions = { overwriteStrategy: options.force !== false }

  const baseConfig = new TSConfig(tree, names.full.base, tscOptions)
  const buildConfig = new TSConfig(tree, names.full.build, tscOptions)
  const testConfig = new TSConfig(tree, names.full.test, tscOptions)

  if (baseConfig.compilerOptions.module) {
    delete baseConfig.compilerOptions.module
  }

  buildConfig.compilerOptions.tsBuildInfoFile ??= tsBuildInfo

  if (options.includeBuild) {
    baseConfig.addReferences(names.relative.build)
    baseConfig.compilerOptions = undefined

    delete buildConfig.compilerOptions.declaration
    buildConfig.compilerOptions.outDir = outDir

    if (target?.every(e => e.includes('node'))) {
      buildConfig.removeTypes('vite/client')
    }

    if (options.react) {
      buildConfig.include.push('src/**/*.tsx')
    }

    if (options.inSourceTests) {
      buildConfig.addTypes('vitest/importMeta')
    }
  } else {
    buildConfig.removeTypes('vite/client')
  }

  if (options.includeTest) {
    baseConfig.addReferences(names.relative.test)
    testConfig.addReferences(names.relative.build)

    if (!options.globals) {
      testConfig.removeTypes('vitest/globals')
    }
  }

  baseConfig.write()
  buildConfig.write()
  testConfig.write()
}
