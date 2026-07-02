import path from 'node:path'

import {
  type ProjectType,
  type Tree,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
} from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

export function normalizeOptions(
  tree: Tree,
  options: VitestConfigSchema,
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
    globals: false,
    includeBuild: false,
    includeTest: true,
    react: false,
    target: [],
    testEnvironment: 'node',
    testReportPath: '.reports/tests',
    ...options,
    baseExtends,
    names,
    outDir: joinPathFragments(offset, 'dist/out-tsc'),
    projectType,
    tsBuildInfo: joinPathFragments(
      offset,
      'out-tsc',
      project.root,
      `${path.basename(names.base.build, '.json')}.tsbuildinfo`,
    ),
  }
}

export interface NormalizedSchema extends Omit<VitestConfigSchema, 'globals' | 'includeTest' | 'testEnvironment' | 'testReportPath'>, Required<Pick<VitestConfigSchema, 'globals' | 'includeTest' | 'testEnvironment' | 'testReportPath'>> {
  baseExtends: string
  includeBuild: false
  names: Names
  outDir: string
  projectType: ProjectType
  react: false
  target: string[]
  tsBuildInfo: string
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
