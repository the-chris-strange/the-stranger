import { Tree } from '@nx/devkit'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestTree } from '../../test/helpers/create-test-tree'
import * as cspellGenerator from '../cspell-config/generator'
import * as eslintGenerator from '../eslint-config/generator'
import * as jestGenerator from '../jest-config/generator'
import * as viteGenerator from '../vite-config/generator'
import { tsLibraryGenerator } from './generator'
import { TSLibrarySchema } from './schema'

describe('ts-library generator', () => {
  let tree: Tree
  let options: TSLibrarySchema

  beforeAll(() => {
    vi.mock('@nx/js')
    vi.mock('./dependencies.ts')
    vi.mock('./manifest.ts')
    vi.mock('../vite-config/generator.ts')
    vi.mock('../cspell-config/generator.ts')
    vi.mock('../jest-config/generator.ts')
    vi.mock('../eslint-config/generator.ts')
  })

  beforeEach(() => {
    tree = createTestTree('test')
    options = {
      force: true,
      name: 'test',
      skipDependencies: true,
      skipFormat: true,
    }
  })

  it('runs the vite config generator if bundler is "vite"', async () => {
    options.bundler = 'vite'
    const spy = vi.spyOn(viteGenerator, 'viteConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).toHaveBeenCalledExactlyOnceWith(
      tree,
      expect.objectContaining({ includeBuild: true }),
    )
  })

  it('runs the vite config generator if unitTestRunner is "vitest"', async () => {
    options.unitTestRunner = 'vitest'
    const spy = vi.spyOn(viteGenerator, 'viteConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).toHaveBeenCalledExactlyOnceWith(
      tree,
      expect.objectContaining({ includeTest: true }),
    )
  })

  it("doesn't run the vite config generator if not using vite or vitest", async () => {
    options.bundler = 'tsc'
    options.unitTestRunner = 'jest'
    const spy = vi.spyOn(viteGenerator, 'viteConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })

  it('runs the jest config generator if unitTestRunner is "jest"', async () => {
    options.unitTestRunner = 'jest'
    const spy = vi.spyOn(jestGenerator, 'jestConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).toHaveBeenCalled()
  })

  it("doesn't run vite or jest config generators if skipTestConfig is true", async () => {
    options.skipTestConfig = true
    const viteSpy = vi.spyOn(viteGenerator, 'viteConfigGenerator')
    const jestSpy = vi.spyOn(jestGenerator, 'jestConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(viteSpy).not.toHaveBeenCalled()
    expect(jestSpy).not.toHaveBeenCalled()
  })

  it("doesn't run eslint config generator if skipEslint is true", async () => {
    options.skipEslint = true
    const spy = vi.spyOn(eslintGenerator, 'eslintConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })

  it("doesn't run cspell config generator if skipCspell is true", async () => {
    options.skipCspell = true
    const spy = vi.spyOn(cspellGenerator, 'cspellConfigGenerator')
    await tsLibraryGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })
})
