import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { type Tree, logger, OverwriteStrategy } from '@nx/devkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TsConfigJson } from 'get-tsconfig'

import { createTestTree } from '../test/utils/create-test-tree'
import { FileNotFoundError } from './errors/file-not-found'
import { readJson } from './json'
import { type TSConfigOptions, TSConfig } from './tsconfig'

describe('TSConfig', () => {
  const path = 'packages/test/tsconfig.json'

  let config: TsConfigJson
  let options: TSConfigOptions
  let tree: Tree
  let tsconfig: TSConfig

  beforeEach(() => {
    config = {
      compilerOptions: {
        paths: {
          '@test/*': ['src/*'],
        },
        types: ['type1', 'type2', 'type3'],
      },
      exclude: ['src/**/*.ts'],
      extends: ['../../tsconfig.json'],
      files: ['src/**/*.spec.ts'],
      include: ['src/**/*.spec.ts'],
      references: [{ path: './tsconfig.spec.json' }, { path: './tsconfig.lib.json' }],
    }
    options = { overwriteStrategy: OverwriteStrategy.Overwrite }
    tree = createTestTree('test')
    tree.write(path, JSON.stringify(config))
    tsconfig = new TSConfig(path, tree, options)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('constructs a new document when the file does not exist', () => {
    const newConfig = new TSConfig('tsconfig.new.json', tree)

    expect(newConfig.config).toStrictEqual({
      compilerOptions: {},
      exclude: [],
      extends: [],
      files: [],
      include: [],
      references: [],
    })
  })

  it('exposes one stable mutable document to direct edits, focused methods, and apply', () => {
    const document = tsconfig.config

    document.compilerOptions.noEmit = true
    tsconfig.addTypes('type4')
    tsconfig.apply({
      compilerOptions: { declaration: true },
      include: ['generated/**/*.ts'],
    })

    expect(tsconfig.config).toBe(document)
    expect(document).toMatchObject({
      compilerOptions: {
        declaration: true,
        noEmit: true,
        types: ['type1', 'type2', 'type3', 'type4'],
      },
      include: ['generated/**/*.ts'],
    })
    expect(tsconfig.toJSON()).toMatchObject({
      compilerOptions: {
        declaration: true,
        noEmit: true,
        types: ['type1', 'type2', 'type3', 'type4'],
      },
    })
  })

  describe('paths', () => {
    it('adds unique path targets in first-seen order', () => {
      tsconfig.addPath('@test/*', 'src/*', '', 'generated/*', 'src/*')
      tsconfig.addPath('@new/*', '', 'new/*', 'new/*')

      expect(tsconfig.config.compilerOptions.paths).toStrictEqual({
        '@new/*': ['new/*'],
        '@test/*': ['src/*', 'generated/*'],
      })
    })

    it('ignores empty aliases and additive inputs', () => {
      const before = structuredClone(tsconfig.config.compilerOptions.paths)

      tsconfig.addPath('', 'ignored/*')
      tsconfig.addPath('@empty/*', '', '')
      tsconfig.addPath('@test/*')

      expect(tsconfig.config.compilerOptions.paths).toStrictEqual(before)
    })

    it('sets and removes aliases', () => {
      tsconfig.setPath('@test/*', 'replacement/*', '', 'replacement/*', 'second/*')
      tsconfig.setPath('@new/*', 'new/*')

      expect(tsconfig.config.compilerOptions.paths).toStrictEqual({
        '@new/*': ['new/*'],
        '@test/*': ['replacement/*', 'second/*'],
      })

      tsconfig.removePath('@new/*')
      tsconfig.setPath('@test/*')

      expect(tsconfig.config.compilerOptions.paths).toBeUndefined()
    })

    it('does nothing when removing a missing alias', () => {
      const before = structuredClone(tsconfig.config.compilerOptions.paths)

      tsconfig.removePath('@missing/*')

      expect(tsconfig.config.compilerOptions.paths).toStrictEqual(before)
    })
  })

  describe('references', () => {
    it('adds references by path in first-seen order', () => {
      tsconfig.addReferences(
        './tsconfig.spec.json',
        { path: '' },
        { path: './tsconfig.e2e.json', prepend: true },
        './tsconfig.e2e.json',
      )

      expect(tsconfig.config.references).toStrictEqual([
        { path: './tsconfig.spec.json' },
        { path: './tsconfig.lib.json' },
        { path: './tsconfig.e2e.json', prepend: true },
      ])
    })

    it('sets references and removes them by path', () => {
      tsconfig.setReferences(
        './tsconfig.app.json',
        { path: './tsconfig.app.json', prepend: true },
        '',
        './tsconfig.e2e.json',
      )

      expect(tsconfig.config.references).toStrictEqual([
        { path: './tsconfig.app.json' },
        { path: './tsconfig.e2e.json' },
      ])

      tsconfig.removeReferences('', './missing.json', './tsconfig.app.json')

      expect(tsconfig.config.references).toStrictEqual([
        { path: './tsconfig.e2e.json' },
      ])
    })

    it('supports empty additive, replacement, and removal inputs', () => {
      const before = structuredClone(tsconfig.config.references)

      tsconfig.addReferences()
      tsconfig.removeReferences()
      expect(tsconfig.config.references).toStrictEqual(before)

      tsconfig.setReferences()
      expect(tsconfig.config.references).toStrictEqual([])
    })
  })

  describe('types', () => {
    it('adds unique types in first-seen order', () => {
      tsconfig.addTypes('type2', '', 'type4', 'type1', 'type5', 'type4')

      expect(tsconfig.config.compilerOptions.types).toStrictEqual([
        'type1',
        'type2',
        'type3',
        'type4',
        'type5',
      ])
    })

    it('sets and removes types', () => {
      tsconfig.setTypes('type4', '', 'type4', 'type2')
      expect(tsconfig.config.compilerOptions.types).toStrictEqual(['type4', 'type2'])

      tsconfig.removeTypes('', 'missing', 'type4')
      expect(tsconfig.config.compilerOptions.types).toStrictEqual(['type2'])

      tsconfig.removeTypes('type2')
      expect(tsconfig.config.compilerOptions.types).toBeUndefined()
    })

    it('supports empty additive, replacement, and removal inputs', () => {
      const before = structuredClone(tsconfig.config.compilerOptions.types)

      tsconfig.addTypes()
      tsconfig.removeTypes()
      expect(tsconfig.config.compilerOptions.types).toStrictEqual(before)

      tsconfig.setTypes()
      expect(tsconfig.config.compilerOptions.types).toBeUndefined()
    })
  })

  describe('.apply', () => {
    it('deeply merges objects and path aliases while replacing arrays', () => {
      tsconfig.apply({
        compilerOptions: {
          declaration: true,
          paths: {
            '@new/*': ['new/*'],
            '@test/*': ['replacement/*', 'replacement/*'],
          },
        },
        include: ['generated/**/*.ts'],
        references: [{ path: './tsconfig.generated.json' }],
      })

      expect(tsconfig.config).toMatchObject({
        compilerOptions: {
          declaration: true,
          paths: {
            '@new/*': ['new/*'],
            '@test/*': ['replacement/*'],
          },
          types: ['type1', 'type2', 'type3'],
        },
        include: ['generated/**/*.ts'],
        references: [{ path: './tsconfig.generated.json' }],
      })
    })

    it('normalizes the merged document', () => {
      tsconfig.apply({
        compilerOptions: {
          paths: { '@empty/*': ['', ''] },
          types: ['type3', '', 'type4', 'type4'],
        },
        references: [
          { path: './tsconfig.lib.json' },
          { path: '' },
          { path: './tsconfig.lib.json' },
        ],
      })

      expect(tsconfig.config.compilerOptions.paths).toStrictEqual({
        '@test/*': ['src/*'],
      })
      expect(tsconfig.config.compilerOptions.types).toStrictEqual(['type3', 'type4'])
      expect(tsconfig.config.references).toStrictEqual([
        { path: './tsconfig.lib.json' },
      ])
    })
  })

  describe('serialization', () => {
    it('returns a detached result without mutating the working document', () => {
      const before = structuredClone(tsconfig.config)
      const json = tsconfig.toJSON()

      json.compilerOptions!.types!.push('detached')
      json.references!.push({ path: './detached.json' })

      expect(tsconfig.config).toStrictEqual(before)
      expect(tsconfig.config.compilerOptions.types).not.toContain('detached')
      expect(tsconfig.config.references).not.toContainEqual({
        path: './detached.json',
      })
    })

    it('preserves arbitrary tsconfig fields and prunes empty values', () => {
      const document = tsconfig.config as typeof tsconfig.config & {
        customField?: { empty?: string; enabled: boolean }
      }
      document.customField = { empty: '', enabled: false }
      document.compilerOptions.paths!['@empty/*'] = []
      document.include = []

      expect(tsconfig.toJSON()).toMatchObject({
        compilerOptions: {
          paths: { '@test/*': ['src/*'] },
        },
        customField: { enabled: false },
      })
      expect(tsconfig.toJSON()).not.toHaveProperty('include')
      expect(tsconfig.toJSON()).not.toHaveProperty('compilerOptions.paths.@empty/*')
    })

    it('retains requested empty properties', () => {
      tsconfig = new TSConfig('empty.json', tree, {
        includeProperties: ['compilerOptions.types', 'files', 'include'],
      })
      tsconfig.config.compilerOptions.types = []

      expect(tsconfig.toJSON()).toStrictEqual({
        compilerOptions: { types: [] },
        files: [],
        include: [],
      })
    })

    it('retains empty properties selected with rooted and quoted paths', () => {
      tsconfig = new TSConfig('empty.json', tree, {
        includeProperties: ['$.compilerOptions.paths["@scope/empty"]'],
      })
      tsconfig.config.compilerOptions.paths = {
        '@scope/empty': [],
      }

      expect(tsconfig.toJSON()).toStrictEqual({
        compilerOptions: {
          paths: {
            '@scope/empty': [],
          },
        },
      })
    })

    it('rejects invalid included property paths', () => {
      tsconfig = new TSConfig('empty.json', tree, {
        includeProperties: ['compilerOptions.[types]'],
      })

      expect(() => tsconfig.toJSON()).toThrow(SyntaxError)
    })

    it('serializes a single extends entry as a string', () => {
      expect(tsconfig.toJSON().extends).toBe('../../tsconfig.json')
      expect(tsconfig.toString()).toBe(JSON.stringify(tsconfig.toJSON()))

      tsconfig.config.extends = ['../../base.json', '../../strict.json']
      expect(tsconfig.toJSON().extends).toStrictEqual([
        '../../base.json',
        '../../strict.json',
      ])
    })
  })

  describe('normalization', () => {
    it('normalizes paths and ordered string collections', () => {
      expect(
        TSConfig.normalizePaths({
          '': ['ignored/*'],
          '@empty/*': ['', ''],
          '@test/*': ['src/*', '', 'generated/*', 'src/*'],
        }),
      ).toStrictEqual({
        '@test/*': ['src/*', 'generated/*'],
      })
      expect(TSConfig.normalizeTypes(['type2', '', 'type1', 'type2'])).toStrictEqual([
        'type2',
        'type1',
      ])
      expect(TSConfig.normalizeTypes(null)).toStrictEqual([])
    })

    it('normalizes references by path while preserving the first reference', () => {
      expect(
        TSConfig.normalizeReferences([
          { path: './first.json', prepend: true },
          { path: '' },
          { path: './first.json' },
          { path: './second.json' },
        ]),
      ).toStrictEqual([
        { path: './first.json', prepend: true },
        { path: './second.json' },
      ])
      expect(TSConfig.normalizeReferences('./single.json')).toStrictEqual([
        { path: './single.json' },
      ])
      expect(TSConfig.normalizeReferences(null as any)).toStrictEqual([])
    })

    it('preserves valid null normalization cases', () => {
      const normalized = TSConfig.normalize({
        compilerOptions: {
          emitBOM: null as any,
          plugins: [{ name: 'plugin' }, { name: null as any }, null as any],
          types: ['type1', null as any, 'type1'],
        },
        exclude: null as any,
        files: null as any,
        include: null as any,
        references: null as any,
      })

      expect(normalized).toStrictEqual({
        compilerOptions: { plugins: [{ name: 'plugin' }], types: ['type1'] },
        exclude: [],
        extends: [],
        files: [],
        include: [],
        references: [],
      })
    })
  })

  describe('Tree persistence', () => {
    const readTreeConfig = (filePath: string, targetTree = tree) =>
      readJson<TsConfigJson>(filePath, targetTree)

    it('creates and writes a new file', () => {
      const newPath = 'packages/test/tsconfig.new.json'
      const newConfig = new TSConfig(newPath, tree)
      newConfig.addTypes('node')
      newConfig.write()

      expect(readTreeConfig(newPath)).toStrictEqual({
        compilerOptions: { types: ['node'] },
      })
    })

    it('reads existing files strictly', () => {
      expect(TSConfig.read(path, tree).toJSON()).toStrictEqual(tsconfig.toJSON())
      expect(() => TSConfig.read('missing.json', tree)).toThrow(FileNotFoundError)
    })

    it('honors overwrite strategies', () => {
      expect(() =>
        tsconfig.write(path, tree, {
          overwriteStrategy: OverwriteStrategy.ThrowIfExisting,
        }),
      ).toThrow(`${path} may not be overwritten`)

      const warn = vi.spyOn(logger, 'warn')
      tsconfig.addTypes('not-written')
      tsconfig.write(path, tree, {
        overwriteStrategy: OverwriteStrategy.KeepExisting,
      })

      expect(warn).toHaveBeenCalledExactlyOnceWith(
        `Refusing to overwrite existing configuration file: ${path}`,
      )
      expect(readTreeConfig(path).compilerOptions?.types).not.toContain('not-written')
    })

    it('rebinds subsequent writes to an alternate path and Tree', () => {
      const alternateTree = createTestTree('alternate')
      const alternatePath = 'packages/alternate/tsconfig.json'

      tsconfig.write(alternatePath, alternateTree)
      tsconfig.addTypes('rebound')
      tsconfig.write()

      expect(
        readTreeConfig(alternatePath, alternateTree).compilerOptions?.types,
      ).toStrictEqual(['type1', 'type2', 'type3', 'rebound'])
      expect(readTreeConfig(path).compilerOptions?.types).toStrictEqual([
        'type1',
        'type2',
        'type3',
      ])
    })

    it('automatically saves when disposed', () => {
      const autoPath = 'packages/test/tsconfig.auto.json'
      const autoConfig = new TSConfig(autoPath, tree, { autoSave: true })
      autoConfig.addTypes('node')

      autoConfig[Symbol.dispose]()

      expect(readTreeConfig(autoPath)).toStrictEqual({
        compilerOptions: { types: ['node'] },
      })
    })
  })

  describe('filesystem persistence', () => {
    let tempRoot: string

    beforeEach(() => {
      tempRoot = mkdtempSync(join(tmpdir(), 'nx-plugin-tsconfig-'))
    })

    afterEach(() => {
      rmSync(tempRoot, { force: true, recursive: true })
    })

    it('creates, reads, and updates a real file', () => {
      const filePath = join(tempRoot, 'tsconfig.json')
      const diskConfig = new TSConfig(filePath)
      diskConfig.config.compilerOptions.target = 'ES2022'
      diskConfig.addTypes('node')
      diskConfig.write()

      expect(TSConfig.read(filePath).toJSON()).toStrictEqual({
        compilerOptions: { target: 'ES2022', types: ['node'] },
      })

      diskConfig.setTypes('vitest')
      diskConfig.write(undefined, undefined, {
        overwriteStrategy: OverwriteStrategy.Overwrite,
      })

      expect(readJson<TsConfigJson>(filePath).compilerOptions?.types).toStrictEqual([
        'vitest',
      ])
    })

    it('strictly rejects a missing real file', () => {
      expect(() => TSConfig.read(join(tempRoot, 'missing.json'))).toThrow(
        FileNotFoundError,
      )
    })

    it('rebinds and automatically saves a real file', () => {
      const initialPath = join(tempRoot, 'tsconfig.initial.json')
      const alternatePath = join(tempRoot, 'tsconfig.alternate.json')
      const diskConfig = new TSConfig(initialPath, undefined, {
        autoSave: true,
        overwriteStrategy: OverwriteStrategy.Overwrite,
      })

      diskConfig.addTypes('node')
      diskConfig.write(alternatePath)
      diskConfig.addTypes('vitest')
      diskConfig[Symbol.dispose]()

      expect(
        readJson<TsConfigJson>(alternatePath).compilerOptions?.types,
      ).toStrictEqual(['node', 'vitest'])
      expect(() => readJson<TsConfigJson>(initialPath)).toThrow(FileNotFoundError)
    })
  })
})
