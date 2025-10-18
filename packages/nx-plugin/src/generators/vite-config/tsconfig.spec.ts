import { readJson, Tree, writeJson } from '@nx/devkit'
import { Tsconfig } from 'tsconfig-type'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { addProject } from '../../tests/helpers/add-project'
import { createTestTree } from '../../tests/helpers/create-test-tree'
import { viteConfigGenerator } from './generator'
import { NormalizedSchema, normalizeOptions } from './options'
import { generateTsc } from './tsconfig'

describe('tsconfig generators', () => {
  let tree: Tree
  let options: NormalizedSchema

  beforeAll(() => {
    vi.mock('../../lib/add-dependencies.ts')
  })

  beforeEach(() => {
    tree = createTestTree('test')

    options = normalizeOptions(tree, {
      force: true,
      includeBuild: true,
      includeTest: true,
      project: 'test',
      skipFormat: true,
    })

    writeJson(tree, 'packages/test/tsconfig.json', {
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
    })

    writeJson(tree, 'packages/test/tsconfig.lib.json', {
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
    })

    writeJson(tree, 'packages/test/tsconfig.spec.json', {
      compilerOptions: {
        outDir: '../../dist/out-tsc',
        types: ['vitest/globals', 'vitest/importMeta', 'vite/client', 'node', 'vitest'],
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
    })
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  const readConfig = (path: string) =>
    readJson<Tsconfig>(
      tree,
      path.startsWith('packages/test') ? path : `packages/test/${path}`,
    )

  it('adds vitest/globals if `globals` option is true', () => {
    options.globals = true

    generateTsc(tree, options)

    const tsconfig = readConfig('tsconfig.spec.json')
    expect(tsconfig.compilerOptions?.types).toContain('vitest/globals')
  })

  it('adds vitest/importMeta to build config if inSourceTests is true', () => {
    options.inSourceTests = true

    generateTsc(tree, options)

    const tsconfig = readConfig('tsconfig.lib.json')
    expect(tsconfig.compilerOptions?.types).toContain('vitest/importMeta')
  })

  it('compiles .tsx files if inSourceTests and react are set', async () => {
    options.inSourceTests = true
    options.react = true

    await viteConfigGenerator(tree, options)

    const tsconfig = readConfig('tsconfig.lib.json')
    expect(tsconfig.include).toContain('src/**/*.tsx')
  })

  it('includes .tsx files in compilation if using react', async () => {
    options.react = true

    await viteConfigGenerator(tree, options)

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
