import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tree } from '@nx/devkit'
import type { TsConfigJson } from 'get-tsconfig'

import type { VitestConfigSchema } from './schema'

import { readJson, writeJson } from '../../lib/json'
import { createTestTree } from '../../test/utils/create-test-tree'
import { generateTsc } from './tsconfig'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('tsconfig generators', () => {
  let tree: Tree
  let options: VitestConfigSchema

  beforeAll(() => {
    tree = createTestTree('test')
  })

  beforeEach(() => {
    options = {
      force: true,
      project: 'test',
      skipFormat: true,
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

  it('keeps vitest/globals if `globals` option is true', () => {
    options.globals = true

    generateTsc(tree, options)

    const tsconfig = readConfig('tsconfig.spec.json')
    expect(tsconfig.compilerOptions?.types).toStrictEqual([
      'vitest/globals',
      'vitest/importMeta',
      'vite/client',
      'node',
      'vitest',
    ])
  })

  it('removes vitest globals and updates references without duplicates', () => {
    generateTsc(tree, options)

    expect(readConfig('tsconfig.spec.json')).toMatchObject({
      compilerOptions: {
        types: ['vitest/importMeta', 'vite/client', 'node', 'vitest'],
      },
      references: [{ path: './tsconfig.lib.json' }],
    })
    expect(readConfig('tsconfig.json').references).toStrictEqual([
      { path: './tsconfig.lib.json' },
      { path: './tsconfig.spec.json' },
    ])
  })
})
