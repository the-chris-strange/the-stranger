import { addProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { removeAll } from './remove-all'

describe('removeAll', () => {
  let tree: Tree
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test-lib', { root: 'packages/test-lib' })
    tree.write('packages/test-lib/file1.ts', '')
    tree.write('packages/test-lib/file2.ts', '')
    tree.write('packages/test-lib/file3.ts', '')
  })

  it('removes files', () => {
    removeAll(tree, 'packages/test-lib/file1.ts', 'packages/test-lib/file2.ts')
    expect(tree.exists('packages/test-lib/file1.ts')).toBe(false)
    expect(tree.exists('packages/test-lib/file2.ts')).toBe(false)
  })
})
