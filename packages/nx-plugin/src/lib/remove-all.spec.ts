import { beforeEach, describe, expect, it } from 'vitest'

import type { Tree } from '@nx/devkit'

import { createTestTree } from '../test/utils/create-test-tree'
import { removeAll } from './remove-all'

describe('removeAll', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree('test-lib')
    tree.write('packages/test-lib/file1.ts', '')
    tree.write('packages/test-lib/file2.ts', '')
    tree.write('packages/test-lib/file3.ts', '')
  })

  it('removes files', () => {
    removeAll(tree, 'packages/test-lib/file1.ts', 'packages/test-lib/file2.ts')
    expect(tree.exists('packages/test-lib/file1.ts')).toBe(false)
    expect(tree.exists('packages/test-lib/file2.ts')).toBe(false)
  })

  it("doesn't remove unspecified files", () => {
    removeAll(tree, 'packages/test-lib/file1.ts', 'packages/test-lib/file2.ts')
    expect(tree.exists('packages/test-lib/file3.ts')).toBe(true)
  })
})
