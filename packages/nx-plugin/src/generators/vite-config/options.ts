import path from 'node:path'

import {
  joinPathFragments,
  offsetFromRoot,
  ProjectType,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit'

import { ExtendRequired } from '../../lib/type-utils'
import { ViteConfigSchema } from './schema'

export function normalizeOptions(
  tree: Tree,
  options: ViteConfigSchema,
): NormalizedSchema {
  const project = readProjectConfiguration(tree, options.project)
  const offset = offsetFromRoot(project.root)

  const baseExtends = joinPathFragments(offset, 'tsconfig.base.json')

  const { projectType = 'library' } = project
  const baseNames: ConfigNames = {
    base: 'tsconfig.json',
    build: options.tsconfigName ?? `tsconfig.${projectType.slice(0, 3)}.json`,
    test: 'tsconfig.spec.json',
  }
  const names: Names = {
    base: baseNames,
    full: {
      base: path.join(project.root, baseNames.base),
      build: path.join(project.root, baseNames.build),
      test: path.join(project.root, baseNames.test),
    },
    relative: {
      base: `./${baseNames.base}`,
      build: `./${baseNames.build}`,
      test: `./${baseNames.test}`,
    },
  }

  return {
    formats: ['es'],
    globals: false,
    includeBuild: true,
    includeTest: true,
    react: false,
    rollupExternals: [],
    target: [],
    testEnvironment: 'node',
    testReportPath: '.reports/tests',
    worker: false,
    ...options,
    baseExtends,
    names,
    outDir: joinPathFragments(offset, 'dist/out-tsc'),
    projectType,
    tsBuildInfo: joinPathFragments(
      offset,
      'dist',
      project.root,
      `${path.basename(names.base.build, '.json')}.tsbuildinfo`,
    ),
  }
}

export interface NormalizedSchema extends StrictViteConfigSchema {
  outDir: string
  tsBuildInfo: string
  names: Names
  baseExtends: string
  projectType: ProjectType
}

interface ConfigNames {
  base: string
  build: string
  test: string
}

interface Names {
  base: ConfigNames
  full: ConfigNames
  relative: ConfigNames
}

type StrictViteConfigSchema = ExtendRequired<
  ViteConfigSchema,
  | 'formats'
  | 'globals'
  | 'includeBuild'
  | 'includeTest'
  | 'react'
  | 'rollupExternals'
  | 'target'
  | 'testEnvironment'
  | 'testReportPath'
  | 'worker'
>
