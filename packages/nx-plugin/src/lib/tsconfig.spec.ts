/* eslint-disable unicorn/no-null */
import {
  addProjectConfiguration,
  OverwriteStrategy,
  readJson,
  Tree,
  writeJson,
} from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { Tsconfig } from 'tsconfig-type'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { TSConfig } from './tsconfig'

const paths = {
  tsconfig: 'packages/test/tsconfig.json',
  types: '$config.compilerOptions.types',
}
let tree: Tree

beforeAll(() => {
  tree = createTreeWithEmptyWorkspace()
  addProjectConfiguration(tree, 'test', { root: 'packages/test' })
})

it('can be constructed', () => {
  expect(() => {
    new TSConfig(tree, paths.tsconfig)
  }).not.toThrow()
})

describe('TSConfig', () => {
  let config: Tsconfig
  let tsconfig: TSConfig

  beforeEach(() => {
    config = {
      compilerOptions: {
        types: ['type1', 'type2', 'type3'],
      },
      exclude: ['src/**/*.ts'],
      extends: '../../tsconfig.json',
      files: ['src/**/*.spec.ts'],
      include: ['src/**/*.spec.ts'],
      references: [{ path: './tsconfig.spec.json' }, { path: './tsconfig.lib.json' }],
    }
    writeJson(tree, paths.tsconfig, config)
    tsconfig = new TSConfig(tree, paths.tsconfig, {
      overwriteStrategy: OverwriteStrategy.Overwrite,
    })
  })

  it('sets values for tree, path, and config', () => {
    expect(tsconfig).toMatchObject({
      $config: config,
      $path: paths.tsconfig,
      $tree: tree,
    })
  })

  describe('shallow getters and setters', () => {
    it('gets the `exclude` property from the underlying config', () => {
      expect(tsconfig.exclude).toStrictEqual(config.exclude)
    })

    it('filters out null values', () => {
      const tsconfig = new TSConfig(tree, paths.tsconfig, {
        overwriteStrategy: OverwriteStrategy.Overwrite,
      })
      tsconfig.exclude = [...config.exclude!, null]
      expect(tsconfig.exclude).not.toContain(null)
    })
  })

  describe('.addTypes', () => {
    it('adds types to the tsconfig file', () => {
      tsconfig.addTypes('type4', 'type5')

      const expected = ['type1', 'type2', 'type3', 'type4', 'type5']
      expect(tsconfig).toHaveProperty(paths.types, expected)
    })

    it("doesn't add duplicate types", () => {
      tsconfig.addTypes('type1', 'type4')

      const expected = ['type1', 'type2', 'type3', 'type4']
      expect(tsconfig).toHaveProperty(paths.types, expected)
    })
  })

  describe('.removeTypes', () => {
    it('removes types from the tsconfig file', () => {
      tsconfig.removeTypes('type1', 'type3')

      expect(tsconfig).toHaveProperty(paths.types, ['type2'])
    })

    it('removes the types option entirely if it is empty', () => {
      const configTypes = ['type1', 'type2', 'type3']
      tsconfig.removeTypes(...configTypes)

      expect(tsconfig).not.toHaveProperty(paths.types)
    })
  })

  describe('.write', () => {
    it("creates a new file if the path provided does't exist", () => {
      if (tree.exists(paths.tsconfig)) {
        tree.delete(paths.tsconfig)
      }

      tsconfig = new TSConfig(tree, paths.tsconfig)
      tsconfig.write()

      expect(tree.exists(paths.tsconfig)).toBe(true)
    })

    it('persists changes to the tsconfig file', () => {
      const options: Tsconfig['compilerOptions'] = {
        charset: 'utf8',
        checkJs: false,
        target: 'ES6',
        types: ['type1', 'type2'],
      }
      tsconfig.compilerOptions = options
      tsconfig.write()

      expect(readJson<Tsconfig>(tree, paths.tsconfig)).toHaveProperty(
        'compilerOptions',
        options,
      )
    })

    it('writes to a different file if provided', () => {
      const path = 'tsconfig.app.json'
      tsconfig.write(undefined, path)

      expect(readJson<Tsconfig>(tree, path)).toMatchObject(config)
    })

    it('writes to a different file tree if provided', () => {
      const newTree = createTreeWithEmptyWorkspace()
      tsconfig.write(newTree, paths.tsconfig)

      expect(readJson<Tsconfig>(newTree, paths.tsconfig)).toMatchObject(config)
    })

    it('updates path and tree if provided', () => {
      const path = 'tsconfig.lib.json'
      const newTree = createTreeWithEmptyWorkspace()
      tsconfig.write(newTree, path)

      expect(tsconfig).toMatchObject({ $path: path, $tree: newTree })
    })
  })
})
