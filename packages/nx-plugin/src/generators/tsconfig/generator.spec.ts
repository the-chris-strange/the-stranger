import { readJson, Tree } from '@nx/devkit'
import { Tsconfig } from 'tsconfig-type'
import { beforeEach, describe, expect, it } from 'vitest'

import { createTestTree } from '../../tests/helpers/create-test-tree'
import { tsconfigGenerator } from './generator'
import { TSConfigSchema } from './schema'

describe('tsconfig generator', () => {
  let tree: Tree
  let options: TSConfigSchema

  beforeEach(() => {
    options = {
      fileName: 'tsconfig.app.json',
      project: 'test',
      skipFormat: true,
    }
    tree = createTestTree({ name: options.project, projectType: 'library' })
  })

  it('runs successfully', async () => {
    await tsconfigGenerator(tree, options)
    expect(tree.exists('packages/test/tsconfig.app.json')).toBe(true)
  })

  it('adds .json to the fileName if necessary', async () => {
    options.fileName = 'tsconfig.spec'
    await tsconfigGenerator(tree, options)
    expect(tree.exists('packages/test/tsconfig.spec.json')).toBe(true)
  })

  it('infers a name for the tsconfig if none provided', async () => {
    delete options.fileName
    await tsconfigGenerator(tree, options)
    expect(tree.exists('packages/test/tsconfig.lib.json')).toBe(true)
  })

  it('sets tsconfig options', async () => {
    const expected: Partial<TSConfigSchema> = {
      compilerOptions: { importHelpers: false, target: 'ESNext' },
      exclude: ['src/**/*.spec.ts'],
      extends: '../../tsconfig.base.json',
      files: ['src/index.ts'],
      include: ['src/some-files/**/*.ts'],
      references: [{ path: './tsconfig.spec.json' }],
    }
    await tsconfigGenerator(tree, { ...options, ...expected })
    expect(readJson<Tsconfig>(tree, 'packages/test/tsconfig.app.json')).toMatchObject(
      expected,
    )
  })
})
