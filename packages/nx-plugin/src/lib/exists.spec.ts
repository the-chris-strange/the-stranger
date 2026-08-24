import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { type Tree, workspaceRoot } from '@nx/devkit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTestTree } from '../test/utils/create-test-tree'
import { exists } from './exists'

describe('exists', () => {
  let tree: Tree
  let tempRoot: string

  beforeEach(() => {
    tree = createTestTree()
    tempRoot = mkdtempSync(join(tmpdir(), 'nx-plugin-exists-'))
  })

  afterEach(() => {
    rmSync(tempRoot, { force: true, recursive: true })
  })

  it('finds files in a tree', () => {
    tree.write('project.json', '{}')

    expect(exists('project.json', tree)).toBe(true)
  })

  it('finds files in the vfs given an absolute path', () => {
    tree.root = workspaceRoot
    const p = resolve(workspaceRoot, 'nx.json')
    expect(exists(p)).toBe(true)
  })

  it('returns false for missing tree files', () => {
    expect(exists('missing.json', tree)).toBe(false)
  })

  it('finds files on disk', () => {
    const filepath = join(tempRoot, 'package.json')
    writeFileSync(filepath, '{}')

    expect(exists(filepath)).toBe(true)
  })

  it('returns false for missing disk files', () => {
    expect(exists(join(tempRoot, 'missing.json'))).toBe(false)
  })
})
