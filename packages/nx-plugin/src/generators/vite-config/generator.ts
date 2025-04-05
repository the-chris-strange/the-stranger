import path from 'node:path'

import {
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { tsconfigGenerator } from '../tsconfig/generator'
import { ViteConfigSchema } from './schema'

export function addProjectDeps(tree: Tree, options: ViteConfigSchema, pkg: string) {
  const deps = ['vite', '@nx/vite', 'nx', 'dotenv', 'vite-plugin-dts']
  if (options.includeTest) {
    deps.push('vitest', '@vitest/coverage-v8')
  }
  if (options.react) {
    deps.push('vite-plugin-react')
    if (options.swc) {
      deps.push('vite-plugin-react-swc')
    }
  }

  addDependenciesToProject(tree, [], deps, pkg)
}

/**
 * Generate Vite configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function viteConfigGenerator(tree: Tree, options: ViteConfigSchema) {
  if (options.includeBuild === false && options.includeTest === false) {
    throw new Error(
      'Failed to generate vite config; config without build or test is unnecessary.',
    )
  }

  const project = readProjectConfiguration(tree, options.project)
  const { projectType = 'library' } = project

  // apply default values
  options.globals ??= false
  options.includeBuild ??= true
  options.includeTest ??= true
  options.react ??= false
  options.rollupExternals ??= []
  options.testEnvironment ??= 'node'
  options.testReportPath ??= '.reports/tests'
  options.tsconfigName ??= `tsconfig.${projectType.slice(0, 3)}.json`

  const offset = offsetFromRoot(project.root)
  const paths = {
    buildOutput: joinPathFragments(offset, 'dist', project.root),
    coverage: joinPathFragments(offset, 'coverage', project.root),
    defineConfig: options.includeTest ? 'vitest/config' : 'vite',
    reactPlugin: options.swc ? 'vite-plugin-react-swc' : 'vite-plugin-react',
    testReports: joinPathFragments(offset, options.testReportPath, project.root),
    viteCache: joinPathFragments(offset, 'node_modules/.vite', project.root),
  }
  const data = { ...options, paths, projectType }

  if (!options.skipTsconfigs) {
    const outDir = joinPathFragments(offset, 'dist/out-tsc', project.root)
    await viteTsconfigGenerator(tree, { ...options, offset, outDir })
  }

  generateFiles(tree, path.join(__dirname, 'files'), project.root, data, {
    overwriteStrategy: owStrategy(options.force),
  })

  if (!options.skipDependencies) {
    addProjectDeps(tree, options, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, options)
}

export async function viteTsconfigGenerator(tree: Tree, options: ViteTSCOptions) {
  const { offset, outDir } = options
  if (options.includeBuild) {
    const types = ['node', 'vite/client']
    if (options.inSourceTests) {
      types.push('vitest/importMeta')
    }

    const exclude = ['vite.config.ts', 'vitest.config.ts', 'src/**/*.spec.ts']
    const include = ['src/**/*.ts']
    if (options.react) {
      exclude.push('src/**/*.spec.tsx')
      include.push('src/**/*.tsx')
    }

    await tsconfigGenerator(tree, {
      ...options,
      compilerOptions: { declaration: true, outDir, types },
      exclude,
      extends: './tsconfig.json',
      fileName: options.tsconfigName,
      include,
    })
  }

  if (options.includeTest) {
    const types = ['vitest/importMeta', 'vite/client', 'node', 'vitest']
    if (options.globals) {
      types.unshift('vitest/globals')
    }

    const include = ['vite.config.ts', 'vitest.config.ts', 'src/**/*.spec.ts']
    if (options.react) {
      include.push('src/**/*.spec.tsx')
    }
    if (options.inSourceTests) {
      include.push('src/**/*.ts')
      if (options.react) {
        include.push('src/**/*.tsx')
      }
    }

    await tsconfigGenerator(tree, {
      ...options,
      compilerOptions: { outDir, types },
      extends: './tsconfig.json',
      fileName: 'tsconfig.spec.json',
      include,
      references: [{ path: `./${options.tsconfigName}` }],
    })
  }

  await tsconfigGenerator(tree, {
    ...options,
    extends: joinPathFragments(offset, 'tsconfig.base.json'),
    references: [
      { path: './tsconfig.spec.json' },
      { path: `./${options.tsconfigName}` },
    ],
    tscOptions: { includeProperties: ['files', 'include'] },
  })
}

export interface ViteTSCOptions extends ViteConfigSchema {
  outDir: string
  offset: string
}

export default viteConfigGenerator
