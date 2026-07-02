import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tree } from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { markerFiles } from '../../lib/config-marker-files'
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
    expect(tree.exists('packages/test/vitest.config.ts')).toBe(true)
  })

  it('removes vitest config files if includeTest is false', async () => {
    options.includeTest = false
    for (const f of markerFiles.vitest) {
      tree.write(`packages/test/${f}`, '')
    }
    await vitestConfigGenerator(tree, options)
    const vitestOnlyMarkers = markerFiles.vitest.filter(e => !(markerFiles.vite as readonly string[]).includes(e))
    expect(vitestOnlyMarkers.some(e => tree.exists(`packages/test/${e}`))).toBe(false)
  })

  it('sets import path for `defineConfig`', async () => {
    await vitestConfigGenerator(tree, options)
    expect(tree.read('packages/test/vitest.config.ts', 'utf8')).toContain(
      "import { defineConfig } from 'vitest/config'",
    )
  })

  it("doesn't generate tsconfigs if skipTsconfigs is true", async () => {
    options.skipTsconfigs = true
    const spy = vi.spyOn(await import('./tsconfig.js'), 'generateTsc')
    spy.mockReset()
    await vitestConfigGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })
})
