import { Tree } from '@nx/devkit'
import { beforeEach, describe, expect, it } from 'vitest'

import { createTestTree } from '../tests/helpers/create-test-tree'
import { findExisting } from './find-existing'

describe('findExisting', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree()
    tree.write('textfile.txt', 'things here')
    tree.write('textfile2.txt', 'more things')
  })

  it('finds the first existing file given a list of files', () => {
    expect(findExisting(tree, 'a-nonexistent-file.md', 'textfile2.txt')).toBe(
      'textfile2.txt',
    )
  })

  it('returns undefined if no file is found', () => {
    expect(findExisting(tree, 'not-a-file.ts', 'things.txt', 'foo.bar')).toBeUndefined()
  })
})
