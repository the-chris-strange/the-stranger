import { logger, OverwriteStrategy, readJson, Tree, writeJson } from '@nx/devkit'
import { Tsconfig } from 'tsconfig-type'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestTree } from '../test/helpers/create-test-tree'
import { TSConfig } from './tsconfig'

describe('TSConfig', () => {
  const paths = {
    compilerOptions: '$config.compilerOptions',
    exclude: '$config.exclude',
    extends: '$config.extends',
    files: '$config.files',
    include: '$config.include',
    references: '$config.references',
    tsconfig: 'packages/test/tsconfig.json',
    types: '$config.compilerOptions.types',
  }

  let config: Tsconfig
  let tsconfig: TSConfig
  let tree: Tree

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
    writeJson(tree, paths.tsconfig, config)
    tsconfig = new TSConfig(tree, paths.tsconfig, {
      overwriteStrategy: OverwriteStrategy.Overwrite,
    })
  })

  it('can be constructed for a new file', () => {
    expect(() => {
      new TSConfig(tree, paths.tsconfig)
    }).not.toThrow()
  })

  it('can be constructed from an existing file', () => {
    expect(() => {
      new TSConfig(tree, paths.tsconfig)
    }).not.toThrow()
  })

  it('sets values for tree, path, and config', () => {
    expect(tsconfig).toMatchObject({
      $config: config,
      $path: paths.tsconfig,
      $tree: tree,
    })
  })

  describe('getters and setters', () => {
    describe('.exclude getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.exclude).toBe(tsconfig['$config']['exclude'])
      })
    })

    describe('.exclude setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.exclude = value
        expect(tsconfig['$config']['exclude']).toStrictEqual(value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.exclude = value
        expect(tsconfig['$config']['exclude']).toStrictEqual([value])
      })

      it.each([null, undefined])(
        'sets the value to an empty array if given `%s`',
        value => {
          tsconfig.exclude = value
          expect(tsconfig['$config']['exclude']).toHaveLength(0)
        },
      )
    })

    describe('.include getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.include).toBe(tsconfig['$config']['include'])
      })
    })

    describe('.include setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.include = value
        expect(tsconfig).toHaveProperty(paths.include, value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.include = value
        expect(tsconfig).toHaveProperty(paths.include, [value])
      })

      it.each([null, undefined])(
        'sets the value to an empty array if given `%s`',
        value => {
          tsconfig.include = value
          expect(tsconfig['$config']['include']).toHaveLength(0)
        },
      )
    })

    describe('.files getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.files).toBe(tsconfig['$config']['files'])
      })
    })

    describe('.files setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.files = value
        expect(tsconfig).toHaveProperty(paths.files, value)
      })

      it('sets the value to an array if given a string', () => {
        const value = 'src/*'
        tsconfig.files = value
        expect(tsconfig).toHaveProperty(paths.files, [value])
      })

      it.each([null, undefined])(
        'sets the value to an empty array if given `%s`',
        value => {
          tsconfig.files = value
          expect(tsconfig['$config']['files']).toHaveLength(0)
        },
      )
    })

    describe('.extends getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.extends).toBe(tsconfig['$config']['extends'])
      })
    })

    describe('.extends setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = ['**/*.src.txt']
        tsconfig.extends = value
        expect(tsconfig).toHaveProperty(paths.extends, value)
      })
    })

    describe('.references getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.references).toBe(tsconfig['$config']['references'])
      })
    })

    describe('.references setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = [{ path: './things.txt' }]
        tsconfig.references = value
        expect(tsconfig).toHaveProperty(paths.references, value)
      })

      it('sets the value to an array of objects if given a string', () => {
        const value = './things.txt'
        tsconfig.references = value
        expect(tsconfig).toHaveProperty(paths.references, [{ path: value }])
      })

      it('sets the value to an array of objects if given an array of strings', () => {
        const value = ['./things.txt', './other-things.md']
        const expected = value.map(e => ({ path: e }))
        tsconfig.references = value
        expect(tsconfig).toHaveProperty(paths.references, expected)
      })

      it('removes empty values', () => {
        tsconfig.references = [null, { path: null }, {}, { path: '' }]
        expect(tsconfig['$config']['references']).toHaveLength(0)
      })

      it.each([null, undefined])(
        'sets the value to an empty array if given `%s`',
        value => {
          tsconfig.references = value
          expect(tsconfig['$config']['references']).toHaveLength(0)
        },
      )
    })

    describe('.compilerOptions getter', () => {
      it('gets the value from the internal configuration', () => {
        expect(tsconfig.compilerOptions).toBe(tsconfig['$config']['compilerOptions'])
      })
    })

    describe('.compilerOptions setter', () => {
      it('sets the value on the internal configuration', () => {
        const value = { declaration: true }
        tsconfig.compilerOptions = value
        expect(tsconfig).toHaveProperty(paths.compilerOptions, value)
      })
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

    it("doesn't add empty values", () => {
      tsconfig.addTypes('', null as any, undefined as any)
      expect(tsconfig).toHaveProperty(paths.types, ['type1', 'type2', 'type3'])
    })

    it('does nothing if given no arguments', () => {
      tsconfig.addTypes()
      expect(tsconfig).toHaveProperty(paths.types, config?.compilerOptions?.types)
    })
  })

  describe('.removeTypes', () => {
    it('removes types from the tsconfig file', () => {
      tsconfig.removeTypes('type1', 'type3')
      expect(tsconfig).toHaveProperty(paths.types, ['type2'])
    })

    it("does nothing if given a type that isn't included", () => {
      tsconfig.removeTypes('non-existent')
      expect(tsconfig).toHaveProperty(paths.types, config?.compilerOptions?.types)
    })

    it('does nothing if given no arguments', () => {
      tsconfig.removeTypes()
      expect(tsconfig).toHaveProperty(paths.types, config?.compilerOptions?.types)
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
      const newTree = createTestTree('another-test')
      const path = 'packages/another-test/tsconfig.json'
      tsconfig.write(newTree, path)
      expect(readJson<Tsconfig>(newTree, path)).toMatchObject(config)
    })

    it('updates path and tree if provided', () => {
      const path = 'tsconfig.lib.json'
      const newTree = createTestTree()
      tsconfig.write(newTree, path)
      expect(tsconfig).toMatchObject({ $path: path, $tree: newTree })
    })

    it("throws if it can't overwrite an existing file", () => {
      writeJson(tree, paths.tsconfig, config)
      expect(() => {
        tsconfig.write(tree, paths.tsconfig, {
          overwriteStrategy: OverwriteStrategy.ThrowIfExisting,
        })
      }).toThrow()
    })

    it('writes a warning to console if overwrite strategy is KeepExisting', () => {
      const spy = vi.spyOn(logger, 'warn')
      tsconfig.write(tree, paths.tsconfig, {
        overwriteStrategy: OverwriteStrategy.KeepExisting,
      })
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        `Refusing to overwrite existing configuration file: ${paths.tsconfig}`,
      )
    })
  })

  describe('TSConfig.read', () => {
    it('reads a config file from the file system', () => {
      expect(TSConfig.read(tree, paths.tsconfig)).toBeDefined()
    })

    it('throws if path does not exist', () => {
      tree.delete(paths.tsconfig)
      expect(() => TSConfig.read(tree, paths.tsconfig)).toThrow()
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
      cfg.compilerOptions!.types!.push(null, 'type3')
      cfg.compilerOptions!.emitBOM = null
      cfg.compilerOptions!.plugins!.push({ name: null }, null)

      expect(TSConfig.normalize(cfg)).toStrictEqual(config)
    })

    it('normalizes paths to array of {path}', () => {
      expect(TSConfig.normalizeReferences('./foo')).toEqual([{ path: './foo' }])
      expect(TSConfig.normalizeReferences([{ path: './bar' }])).toEqual([
        { path: './bar' },
      ])
      expect(TSConfig.normalizeReferences(null)).toEqual([])
    })
  })
})
