import { addProjectConfiguration, readJson, Tree, writeJson } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { Tsconfig } from 'tsconfig-type'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { viteConfigGenerator } from './generator'
import { ViteConfigSchema } from './schema'

describe('vite config generator', () => {
  let tree: Tree
  let options: ViteConfigSchema

  beforeAll(() => {
    vi.mock('../../lib/add-dependencies.ts')
  })

  beforeEach(() => {
    options = {
      force: true,
      includeBuild: true,
      includeTest: true,
      project: 'test',
      skipFormat: true,
    }
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test', { root: 'packages/test', sourceRoot: 'src' })
    writeJson(tree, 'packages/test/tsconfig.json', {})
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('runs successfully', async () => {
    await viteConfigGenerator(tree, options)

    expect(tree.exists('packages/test/vite.config.ts')).toBe(true)
  })

  it('throws if both includeBuild and includeTest are false', async () => {
    options.includeBuild = false
    options.includeTest = false

    await expect(viteConfigGenerator(tree, options)).rejects.toThrow()
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

  describe('tsconfig generators', () => {
    const readConfig = (path: string) =>
      readJson<Tsconfig>(
        tree,
        path.startsWith('packages/test') ? path : `packages/test/${path}`,
      )

    it("doesn't generate tsconfigs if skipTsconfigs is set", async () => {
      options.skipTsconfigs = true
      const spy = vi.spyOn(await import('../tsconfig/generator'), 'tsconfigGenerator')

      await viteConfigGenerator(tree, options)

      expect(spy).not.toHaveBeenCalled()
    })

    it('adds vitest/globals to tsconfig if globals is set', async () => {
      options.globals = true

      await viteConfigGenerator(tree, options)

      const tsconfig = readConfig('tsconfig.spec.json')
      expect(tsconfig.compilerOptions?.types).toContain('vitest/globals')
    })

    it('adds vitest/importMeta to tsconfig if inSourceTests is set', async () => {
      options.inSourceTests = true

      await viteConfigGenerator(tree, options)

      const tsconfig = readConfig('tsconfig.lib.json')
      expect(tsconfig.compilerOptions?.types).toContain('vitest/importMeta')
    })

    it('compiles .tsx files if inSourceTests and react are set', async () => {
      options.inSourceTests = true
      options.react = true

      await viteConfigGenerator(tree, options)

      const tsconfig = readConfig('tsconfig.lib.json')
      expect(tsconfig.include).toContain('src/**/*.tsx')
    })

    it('includes .tsx files in compilation if using react', async () => {
      options.react = true

      await viteConfigGenerator(tree, options)

      const tsconfig = readConfig('tsconfig.lib.json')
      expect(tsconfig.include).toContain('src/**/*.tsx')
    })

    it('excludes .spec.tsx files in compilation if using react', async () => {
      options.react = true

      await viteConfigGenerator(tree, options)

      const tsconfig = readConfig('tsconfig.lib.json')
      expect(tsconfig.exclude).toContain('src/**/*.spec.tsx')
    })

    it('creates tsconfig.app.json if the project is an application', async () => {
      addProjectConfiguration(tree, 'app-test', {
        projectType: 'application',
        root: 'packages/app-test',
      })
      options.project = 'app-test'

      await viteConfigGenerator(tree, options)

      expect(tree.exists('packages/app-test/tsconfig.app.json')).toBe(true)
    })
  })
})
