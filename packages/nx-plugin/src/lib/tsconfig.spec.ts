import '../test/matchers/to-match-set'

import { type Tree, logger, OverwriteStrategy } from '@nx/devkit'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TsConfigJson } from 'get-tsconfig'

import { createTestTree } from '../test/utils/create-test-tree'
import { readJson, writeJson } from './json'
import { type TSConfigOptions, TSConfig } from './tsconfig'

describe('TSConfig', () => {
  const paths = {
    tsconfig: 'packages/test/tsconfig.json',
  } as const

  let config: TsConfigJson
  let tsconfig: TSConfig
  let tree: Tree
  let options: TSConfigOptions

  beforeAll(() => {
    tree = createTestTree('test')
  })

  beforeEach(() => {
    config = {
      compilerOptions: {
        types: ['type1', 'type2', 'type3'],
      },
      exclude: ['src/**/*.ts'],
      extends: ['../../tsconfig.json'],
      files: ['src/**/*.spec.ts'],
      include: ['src/**/*.spec.ts'],
      references: [{ path: './tsconfig.spec.json' }, { path: './tsconfig.lib.json' }],
    }
    options = { overwriteStrategy: OverwriteStrategy.Overwrite }
    tree.write(paths.tsconfig, JSON.stringify(config))
    tsconfig = new TSConfig(paths.tsconfig, tree, options)
  })

  it('can be constructed for a new file', () => {
    expect(() => {
      new TSConfig('tsconfig.json', tree)
    }).not.toThrow()
  })

  it('can be constructed from an existing file', () => {
    expect(() => {
      new TSConfig(paths.tsconfig, tree)
    }).not.toThrow()
  })

  it('serializes the existing config', () => {
    expect(tsconfig.toJSON()).toStrictEqual(config)
  })

  describe('getters and setters', () => {
    describe('.exclude getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.exclude).toStrictEqual(config.exclude)
      })
    })

    describe('.exclude setter', () => {
      it('sets the value on the configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.exclude = value
        expect(tsconfig.exclude).toStrictEqual(value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.exclude = value
        expect(tsconfig.exclude).toStrictEqual([value])
      })

      it('sets the value to an empty array if given null', () => {
        tsconfig.exclude = null as any
        expect(tsconfig.exclude).toHaveLength(0)
      })
    })

    describe('.include getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.include).toStrictEqual(config.include)
      })
    })

    describe('.include setter', () => {
      it('sets the value on the configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.include = value
        expect(tsconfig.include).toStrictEqual(value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.include = value
        expect(tsconfig.include).toStrictEqual([value])
      })

      it('sets the value to an empty array if given null', () => {
        tsconfig.include = null as any
        expect(tsconfig.include).toHaveLength(0)
      })
    })

    describe('.files getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.files).toStrictEqual(config.files)
      })
    })

    describe('.files setter', () => {
      it('sets the value on the configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.files = value
        expect(tsconfig.files).toStrictEqual(value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.files = value
        expect(tsconfig.files).toStrictEqual([value])
      })

      it('sets the value to an empty array if given null', () => {
        tsconfig.files = null as any
        expect(tsconfig.files).toHaveLength(0)
      })
    })

    describe('.extends getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.extends).toStrictEqual(config.extends)
      })
    })

    describe('.extends setter', () => {
      it('sets the value on the configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.extends = value
        expect(tsconfig.extends).toStrictEqual(value)
      })
    })

    describe('.references getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.references).toStrictEqual(config.references)
      })
    })

    describe('.references setter', () => {
      it('sets the value on the configuration', () => {
        const value = [{ path: './things.txt' }]
        tsconfig.references = value
        expect(tsconfig.references).toStrictEqual(value)
      })

      it('sets the value to an array of objects if given a string', () => {
        const value = './things.txt'
        tsconfig.references = value
        expect(tsconfig.references).toStrictEqual([{ path: value }])
      })

      it('sets the value to an array of objects if given an array of strings', () => {
        const value = ['./things.txt', './other-things.md']
        const expected = value.map(e => ({ path: e }))
        tsconfig.references = value
        expect(tsconfig.references).toStrictEqual(expected)
      })

      it('removes references with empty paths', () => {
        tsconfig.references = [{ path: '' }]
        expect(tsconfig.references).toHaveLength(0)
      })

      it('sets the value to an empty array if given null', () => {
        tsconfig.references = null as any
        expect(tsconfig.references).toHaveLength(0)
      })
    })

    describe('.compilerOptions getter', () => {
      it('gets the value from the configuration', () => {
        expect(tsconfig.compilerOptions).toStrictEqual(config.compilerOptions)
      })
    })

    describe('.compilerOptions setter', () => {
      it('sets the value on the configuration', () => {
        const value = { declaration: true }
        tsconfig.compilerOptions = value
        expect(tsconfig.compilerOptions).toStrictEqual(value)
      })
    })
  })

  describe('.addTypes', () => {
    it('adds types to the tsconfig file', () => {
      tsconfig.addTypes('type4', 'type5')
      const expected = ['type1', 'type2', 'type3', 'type4', 'type5']
      expect(tsconfig.toJSON().compilerOptions?.types).toMatchSet(expected)
    })

    it("doesn't add duplicate types", () => {
      tsconfig.addTypes('type1', 'type4')
      const expected = ['type1', 'type2', 'type3', 'type4']
      expect(tsconfig.toJSON().compilerOptions?.types).toMatchSet(expected)
    })

    it("doesn't add empty values", () => {
      const before = tsconfig.toJSON().compilerOptions?.types
      tsconfig.addTypes('')
      expect(tsconfig.toJSON().compilerOptions?.types).toStrictEqual(before)
    })

    it('does nothing if given no arguments', () => {
      const before = tsconfig.toJSON().compilerOptions?.types
      tsconfig.addTypes()
      expect(tsconfig.toJSON().compilerOptions?.types).toStrictEqual(before)
    })
  })

  describe('.removeTypes', () => {
    it('removes types from the tsconfig file', () => {
      tsconfig.removeTypes('type1', 'type3')
      expect(tsconfig.toJSON().compilerOptions?.types).toMatchSet(['type2'])
    })

    it("does nothing if given a type that isn't included", () => {
      const before = tsconfig.toJSON().compilerOptions?.types
      tsconfig.removeTypes('non-existent')
      expect(tsconfig.toJSON().compilerOptions?.types).toStrictEqual(before)
    })

    it('does nothing if given no arguments', () => {
      const before = tsconfig.toJSON().compilerOptions?.types
      tsconfig.removeTypes()
      expect(tsconfig.toJSON().compilerOptions?.types).toStrictEqual(before)
    })
  })

  describe('.addReferences', () => {
    it('adds references to the configuration', () => {
      const paths = ['./thing1.txt', './thing2.md']
      const expected = [...config.references!, ...paths.map(e => ({ path: e }))]
      tsconfig.addReferences(paths[0], { path: paths[1] })
      expect(tsconfig.references).toStrictEqual(expected)
    })
  })

  describe('.write', () => {
    const readConfig = (path: string) => readJson<TsConfigJson>(path, tree)

    it("creates a new file if the path provided does't exist", () => {
      tree.delete(paths.tsconfig)

      tsconfig = new TSConfig(paths.tsconfig, tree)
      tsconfig.write()

      expect(tree.exists(paths.tsconfig)).toBe(true)
    })

    it('persists changes to the tsconfig file', () => {
      const options: TsConfigJson['compilerOptions'] = {
        charset: 'utf8',
        checkJs: false,
        target: 'ES6',
        types: ['type1', 'type2'],
      }
      tsconfig.compilerOptions = options
      tsconfig.write()

      expect(readConfig(paths.tsconfig)).toHaveProperty('compilerOptions', options)
    })

    it('writes to a different file if provided', () => {
      const path = 'tsconfig.app.json'
      tsconfig.write(path)

      expect(readConfig(path)).toMatchObject(config)
    })

    it('writes to a different file tree if provided', () => {
      const newTree = createTestTree('another-test')
      const path = 'packages/another-test/tsconfig.json'
      tsconfig.write(path, newTree)
      expect(readJson<TsConfigJson>(path, newTree)).toMatchObject(config)
    })

    it('updates path and tree if provided', () => {
      const path = 'tsconfig.lib.json'
      const newTree = createTestTree()
      tsconfig.write(path, newTree)
      tsconfig.addTypes('new-type')
      tsconfig.write()
      expect(readJson<TsConfigJson>(path, newTree)).toHaveProperty(
        'compilerOptions.types',
        ['type1', 'type2', 'type3', 'new-type'],
      )
    })

    it("throws if it can't overwrite an existing file", () => {
      writeJson(paths.tsconfig, config, tree)
      expect(() => {
        tsconfig.write(paths.tsconfig, tree, {
          overwriteStrategy: OverwriteStrategy.ThrowIfExisting,
        })
      }).toThrow()
    })

    it('writes a warning to console if overwrite strategy is KeepExisting', () => {
      const spy = vi.spyOn(logger, 'warn')
      tsconfig.write(paths.tsconfig, tree, {
        overwriteStrategy: OverwriteStrategy.KeepExisting,
      })
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        `Refusing to overwrite existing configuration file: ${paths.tsconfig}`,
      )
    })
  })

  describe('TSConfig.read', () => {
    it('reads a config file from the file system', () => {
      expect(TSConfig.read(paths.tsconfig, tree)).toBeDefined()
    })

    it('throws if path does not exist', () => {
      tree.delete(paths.tsconfig)
      expect(() => TSConfig.read(paths.tsconfig, tree)).toThrow()
    })
  })

  describe('TSConfig.normalize', () => {
    beforeEach(() => {
      config = {
        compilerOptions: {
          types: ['type1', 'type2', 'type3'],
        },
        exclude: ['src/**/*.ts'],
        extends: ['../../tsconfig.json'],
        files: ['src/**/*.spec.ts'],
        include: ['src/**/*.spec.ts'],
        references: [{ path: './tsconfig.spec.json' }, { path: './tsconfig.lib.json' }],
      }
    })

    it('normalizes top-level properties', () => {
      config.compilerOptions!.plugins = [{ name: 'things' }]
      const cfg = structuredClone(config)
      cfg.compilerOptions!.types!.push(null as any, 'type3')
      cfg.compilerOptions!.emitBOM = null as any
      cfg.compilerOptions!.plugins!.push({ name: null as any }, null as any)
      expect(TSConfig.normalize(cfg)).toStrictEqual(config)
    })

    it('normalizes paths to array of {path}', () => {
      expect(TSConfig.normalizeReferences('./foo')).toStrictEqual([{ path: './foo' }])
      expect(TSConfig.normalizeReferences([{ path: './bar' }])).toStrictEqual([
        { path: './bar' },
      ])
      expect(TSConfig.normalizeReferences(null as any)).toStrictEqual([])
    })
  })
})
