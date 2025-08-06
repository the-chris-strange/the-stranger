import { Tree } from '@nx/devkit'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import configMarkerFiles from '../../lib/config-marker-files'
import { createTestTree } from '../../tests/helpers/create-test-tree'
import { viteConfigGenerator } from './generator'
import { ViteConfigSchema } from './schema'

describe('vite config generator', () => {
  let tree: Tree
  let options: ViteConfigSchema

  beforeAll(() => {
    vi.mock('./dependencies.ts')
  })

  beforeEach(() => {
    options = {
      force: true,
      includeBuild: true,
      includeTest: true,
      project: 'test',
      skipFormat: true,
    }
    tree = createTestTree('test')
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('runs successfully', async () => {
    await viteConfigGenerator(tree, options)
    expect(tree.exists('packages/test/vite.config.ts')).toBe(true)
  })

  it('removes vite config files if both includeBuild and includeTest are false', async () => {
    options.includeBuild = false
    options.includeTest = false
    for (const f of configMarkerFiles.vitest) {
      tree.write(`packages/test/${f}`, '')
    }
    await viteConfigGenerator(tree, options)
    expect(configMarkerFiles.vitest.some(e => tree.exists(`packages/test/${e}`))).toBe(
      false,
    )
  })

  it('sets import path for `defineConfig` if including test config', async () => {
    await viteConfigGenerator(tree, options)
    expect(tree.read('packages/test/vite.config.ts', 'utf8')).toContain(
      "import { defineConfig } from 'vitest/config'",
    )
  })

  it('sets import path for `defineConfig` if not including test config', async () => {
    options.includeTest = false
    await viteConfigGenerator(tree, options)
    expect(tree.read('packages/test/vite.config.ts', 'utf8')).toContain(
      "import { defineConfig } from 'vite'",
    )
  })

  it('sets import path for react plugin if swc is not set', async () => {
    options.react = true
    options.swc = false
    await viteConfigGenerator(tree, options)
    expect(tree.read('packages/test/vite.config.ts', 'utf8')).toContain(
      "import react from 'vite-plugin-react'",
    )
  })

  it('sets import path for react plugin if swc is set', async () => {
    options.react = true
    options.swc = true
    await viteConfigGenerator(tree, options)
    expect(tree.read('packages/test/vite.config.ts', 'utf8')).toContain(
      "import react from 'vite-plugin-react-swc'",
    )
  })

  it("doesn't generate tsconfigs if skipTsconfigs is true", async () => {
    options.skipTsconfigs = true
    const spy = vi.spyOn(await import('./tsconfig'), 'generateTsc')
    await viteConfigGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })
})
