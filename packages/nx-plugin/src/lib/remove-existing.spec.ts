import { addProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { removeExisting } from './remove-existing'

describe('removeExisting', () => {
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

  it('returns true if a file was deleted', () => {
    expect(removeExisting(tree, 'textfile.txt')).toBe(true)
  })

  it('returns false if no file was found', () => {
    expect(removeExisting(tree, 'nonexistent.txt')).toBe(false)
  })

  it('removes the first existing file from a list of files', () => {
    removeExisting(tree, 'a-nonexistent-file.md', 'textfile2.txt')

    expect(tree.exists('textfile2.txt')).toBe(false)
  })

  it('removes only the first existing file from a list of files', () => {
    removeExisting(tree, 'textfile.txt', 'textfile2.txt')

    expect(tree.exists('textfile.txt')).toBe(false)
    expect(tree.exists('textfile2.txt')).toBe(true)
  })
})
