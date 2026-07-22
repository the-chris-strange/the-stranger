import { type Tree } from '@nx/devkit'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TsConfigJson } from 'get-tsconfig'

import type { ViteConfigSchema } from './schema'

import { readJson, writeJson } from '../../lib/json'
import { addProject } from '../../test/utils/add-project'
import { createTestTree } from '../../test/utils/create-test-tree'
import { viteConfigGenerator } from './generator'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('tsconfig generators', () => {
  let tree: Tree
  let options: ViteConfigSchema

  beforeAll(() => {
    tree = createTestTree('test')
  })

  beforeEach(() => {
    options = {
      force: true,
      project: 'test',
      skipFormat: true,
      skipTsconfigs: false,
    }

    writeJson(
      'packages/test/tsconfig.json',
      {
        compilerOptions: {
          forceConsistentCasingInFileNames: true,
          importHelpers: true,
          module: 'commonjs',
          noFallthroughCasesInSwitch: true,
          noImplicitOverride: true,
          noImplicitReturns: true,
          noPropertyAccessFromIndexSignature: true,
          strict: true,
        },
        extends: '../../tsconfig.base.json',
        files: [],
        include: [],
        references: [{ path: './tsconfig.lib.json' }, { path: './tsconfig.spec.json' }],
      },
      tree,
    )

    writeJson(
      'packages/test/tsconfig.lib.json',
      {
        compilerOptions: {
          declaration: true,
          outDir: '../../dist/out-tsc',
          types: ['node', 'vite/client'],
        },
        exclude: [
          'vite.config.ts',
          'vite.config.mts',
          'vitest.config.ts',
          'vitest.config.mts',
          'src/**/*.test.ts',
          'src/**/*.spec.ts',
          'src/**/*.test.tsx',
          'src/**/*.spec.tsx',
          'src/**/*.test.js',
          'src/**/*.spec.js',
          'src/**/*.test.jsx',
          'src/**/*.spec.jsx',
        ],
        extends: './tsconfig.json',
        include: ['src/**/*.ts'],
      },
      tree,
    )

    writeJson(
      'packages/test/tsconfig.spec.json',
      {
        compilerOptions: {
          outDir: '../../dist/out-tsc',
          types: [
            'vitest/globals',
            'vitest/importMeta',
            'vite/client',
            'node',
            'vitest',
          ],
        },
        extends: './tsconfig.json',
        include: [
          'vite.config.ts',
          'vite.config.mts',
          'vitest.config.ts',
          'vitest.config.mts',
          'src/**/*.test.ts',
          'src/**/*.spec.ts',
          'src/**/*.test.tsx',
          'src/**/*.spec.tsx',
          'src/**/*.test.js',
          'src/**/*.spec.js',
          'src/**/*.test.jsx',
          'src/**/*.spec.jsx',
          'src/**/*.d.ts',
        ],
      },
      tree,
    )
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  const readConfig = (path: string) =>
    readJson<TsConfigJson>(
      path.startsWith('packages/test') ? path : `packages/test/${path}`,
      tree,
    )

  it('includes .tsx files in compilation if using react', async () => {
    options.react = true

    await viteConfigGenerator(tree, options)

    console.log(readConfig('packages/test/tsconfig.lib.json'))

    const tsconfig = readConfig('tsconfig.lib.json')
    expect(tsconfig.include).toContain('src/**/*.tsx')
  })

  it('creates tsconfig.app.json if the project is an application', async () => {
    options.project = 'app-test'
    addProject(tree, { name: options.project, projectType: 'application' })

    await viteConfigGenerator(tree, options)

    expect(tree.exists('packages/app-test/tsconfig.app.json')).toBe(true)
  })

  it('removes vite/client from build types if only targeting node', async () => {
    options.target = ['node24']
    await viteConfigGenerator(tree, options)
    expect(readConfig('tsconfig.lib.json').compilerOptions?.types).not.toContain(
      'vite/client',
    )
  })
})
