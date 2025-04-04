import { addProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { findExisting } from './find-existing'

describe('findExisting', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    const projects = ['test1', 'test2']
    for (const projectName of projects) {
      addProjectConfiguration(tree, projectName, { root: `packages/${projectName}` })
    }
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
