import { readProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tsLibraryGenerator } from './generator'
import { TSLibrarySchema } from './schema'

describe('ts-library generator', { timeout: 8000 }, () => {
  let tree: Tree
  let options: TSLibrarySchema

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    options = {
      force: true,
      name: 'test',
      skipDependencies: true,
      skipFormat: true,
    }
  })

  it('runs successfully', async () => {
    await tsLibraryGenerator(tree, options)

    const config = readProjectConfiguration(tree, 'test')
    expect(config).toBeDefined()
  })

  it("doesn't generate vitest config if not using vitest runner", async () => {
    options.unitTestRunner = 'jest'
    const spy = vi.spyOn(
      await import('../vite-config/generator'),
      'viteConfigGenerator',
    )

    await tsLibraryGenerator(tree, options)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      expect.objectContaining({ includeTest: false }),
    )
  })

  it("doesn't generate vite build config if not using vite compiler", async () => {
    options.bundler = 'tsc'
    options.unitTestRunner = 'vitest'
    const spy = vi.spyOn(
      await import('../vite-config/generator'),
      'viteConfigGenerator',
    )

    await tsLibraryGenerator(tree, options)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      expect.objectContaining({ includeBuild: false }),
    )
  })

  it("doesn't generate a vite config if neither vite compiler or vitest runner are used", async () => {
    options.bundler = 'tsc'
    options.unitTestRunner = 'jest'
    const spy = vi.spyOn(
      await import('../vite-config/generator'),
      'viteConfigGenerator',
    )

    await tsLibraryGenerator(tree, options)

    expect(spy).not.toHaveBeenCalled()
  })
})
