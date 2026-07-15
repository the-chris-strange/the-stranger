import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tree } from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { createTestTree } from '../../test/utils/create-test-tree'
import { vitestConfigGenerator } from './generator'

vi.mock(import('./tsconfig.ts'))
vi.mock(import('./dependencies.ts'))

describe('vitest config generator', () => {
  let tree: Tree
  let options: VitestConfigSchema

  beforeEach(() => {
    options = {
      force: true,
      project: 'test',
      skipFormat: true,
    }
    tree = createTestTree('test')
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('creates a config by default', async () => {
    await vitestConfigGenerator(tree, options)
    expect(tree.exists('packages/test/vitest.config.mts')).toBe(true)
  })

  it("doesn't generate tsconfigs if skipTsconfigs is true", async () => {
    options.skipTsconfigs = true
    const spy = vi.spyOn(await import('./tsconfig.js'), 'generateTsc')
    spy.mockReset()
    await vitestConfigGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })
})
