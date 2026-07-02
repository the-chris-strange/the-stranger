import { type Tree, readJson, writeJson } from '@nx/devkit'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tsconfig } from 'tsconfig-type'

import { createTestTree } from '../../test/utils/create-test-tree'
import { type NormalizedSchema, normalizeOptions } from './options'
import { generateTsc } from './tsconfig'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('tsconfig generators', () => {
  let tree: Tree
  let options: NormalizedSchema

  beforeAll(() => {
    tree = createTestTree('test')
  })

  beforeEach(() => {
    options = normalizeOptions(tree, {
      force: true,
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
    vi.resetAllMocks()
    vi.resetModules()
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

})
