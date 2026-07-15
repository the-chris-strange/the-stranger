import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { type Tree } from '@nx/devkit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTestTree } from '../test/utils/create-test-tree'
import { FileNotFoundError } from './errors/file-not-found'
import { maybeReadJson, readJson, writeJson } from './json'

interface TestJson {
  name: string
  enabled?: boolean
}

describe('maybeReadJson', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree()
  })

  it('reads JSON from a tree', () => {
    tree.write('config.json', JSON.stringify({ enabled: true, name: 'test' }))

    expect(maybeReadJson<TestJson>('config.json', tree)).toStrictEqual({
      enabled: true,
      name: 'test',
    })
  })

  it('returns undefined for missing files', () => {
    expect(maybeReadJson('missing.json', tree)).toBeUndefined()
  })

  it('throws parse errors', () => {
    tree.write('config.json', '{')

    expect(() => maybeReadJson('config.json', tree)).toThrow('Cannot parse config.json')
  })
})

describe('readJson', () => {
  let tree: Tree
  let tempRoot: string

  beforeEach(() => {
    tree = createTestTree()
    tempRoot = mkdtempSync(join(tmpdir(), 'nx-plugin-json-'))
  })

  afterEach(() => {
    rmSync(tempRoot, { force: true, recursive: true })
  })

  it('reads JSON from a tree', () => {
    tree.write('config.json', JSON.stringify({ name: 'tree' }))

    expect(readJson<TestJson>('config.json', tree)).toStrictEqual({ name: 'tree' })
  })

  it('reads JSON from disk', () => {
    const filepath = join(tempRoot, 'config.json')
    writeJson(filepath, { name: 'disk' })

    expect(readJson<TestJson>(filepath)).toStrictEqual({ name: 'disk' })
  })

  it('throws FileNotFoundError for missing files', () => {
    expect(() => readJson<TestJson>('missing.json', tree)).toThrow(FileNotFoundError)
  })
})

describe('writeJson', () => {
  let tree: Tree
  let tempRoot: string

  beforeEach(() => {
    tree = createTestTree()
    tempRoot = mkdtempSync(join(tmpdir(), 'nx-plugin-json-'))
  })

  afterEach(() => {
    rmSync(tempRoot, { force: true, recursive: true })
  })

  it('writes JSON to a tree', () => {
    writeJson('config.json', { name: 'tree' }, tree)

    expect(readJson<TestJson>('config.json', tree)).toStrictEqual({ name: 'tree' })
  })

  it('writes JSON to a tree with options', () => {
    writeJson('config.json', { name: 'tree' }, { spaces: 4, tree })

    expect(tree.read('config.json', 'utf8')).toBe('{\n    "name": "tree"\n}\n')
  })

  it('writes JSON to disk', () => {
    const filepath = join(tempRoot, 'config.json')

    writeJson(filepath, { name: 'disk' }, { spaces: 2 })

    expect(readFileSync(filepath, 'utf8')).toBe('{\n  "name": "disk"\n}')
  })
})
