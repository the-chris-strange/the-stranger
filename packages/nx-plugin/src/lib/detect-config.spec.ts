import { addProjectConfiguration, joinPathFragments, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { detectConfig, MARKER_FILES } from './detect-config'

const testFiles = Object.entries(MARKER_FILES).flatMap(([key, value]) =>
  value.map(e => [key, e]),
)

describe('detectConfig', () => {
  const root = 'packages/test-lib'
  let tree: Tree

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test-lib', { root })
  })

  it.each(testFiles)(
    'detects %s config using %s as a marker file',
    (config, marker) => {
      tree.write(joinPathFragments(root, marker), '')
      expect(detectConfig(tree, config as any, root)).toBe(true)
    },
  )

  it('assumes vitest is present if vite is present', () => {
    tree.write(joinPathFragments(root, 'vite.config.mts'), '')
    expect(detectConfig(tree, 'vitest', root)).toBe(true)
  })

  it('returns false if no marker files are found', () => {
    expect(detectConfig(tree, 'eslint', root)).toBe(false)
  })

  it('does not apply prefix if not provided', async () => {
    const spy = vi.spyOn(await import('./find-existing'), 'findExisting')

    detectConfig(tree, 'cspell')

    expect(spy).toHaveBeenLastCalledWith(tree, 'cspell.config.yaml', 'cspell.json')
  })
})
