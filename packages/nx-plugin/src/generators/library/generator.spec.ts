import {
  type MockInstance,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { Tree } from '@nx/devkit'

import type { LibrarySchema } from './schema'

import { createTestTree } from '../../test/utils/create-test-tree'
import libraryGenerator from './generator'

vi.mock(import('@nx/js'))
vi.mock(import('./dependencies.ts'))
vi.mock(import('./manifest.ts'))
vi.mock(import('../vite-config/generator.ts'))
vi.mock(import('../vitest-config/generator.ts'))
vi.mock(import('../cspell-config/generator.ts'))
vi.mock(import('../jest-config/generator.ts'))
vi.mock(import('../eslint-config/generator.ts'))

describe('library generator', () => {
  let tree: Tree
  let options: LibrarySchema
  let viteConfigSpy: MockInstance
  let vitestConfigSpy: MockInstance
  let cspellConfigSpy: MockInstance
  let jestConfigSpy: MockInstance
  let eslintConfigSpy: MockInstance
  let nxLibSpy: MockInstance

  beforeAll(async () => {
    viteConfigSpy = vi.spyOn(
      await import('../vite-config/generator.js'),
      'viteConfigGenerator',
    )
    vitestConfigSpy = vi.spyOn(
      await import('../vitest-config/generator.js'),
      'vitestConfigGenerator',
    )
    cspellConfigSpy = vi.spyOn(
      await import('../cspell-config/generator.js'),
      'cspellConfigGenerator',
    )
    jestConfigSpy = vi.spyOn(
      await import('../jest-config/generator.js'),
      'jestConfigGenerator',
    )
    eslintConfigSpy = vi.spyOn(
      await import('../eslint-config/generator.js'),
      'eslintConfigGenerator',
    )
    nxLibSpy = vi.spyOn(await import('@nx/js'), 'libraryGenerator')
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

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('runs the vite config generator if bundler is `vite`', async () => {
    options.bundler = 'vite'

    await libraryGenerator(tree, options)

    expect(viteConfigSpy).toHaveBeenCalled()
    expect(nxLibSpy).toHaveBeenCalledWith(
      tree,
      expect.not.objectContaining({ bundler: 'vite' }),
    )
  })

  it.each([
    'tsc',
    'esbuild',
    'rollup',
    'swc',
    'none',
    undefined,
  ] satisfies LibrarySchema['bundler'][])(
    'defers to the nx library generator for build setup if the bundler is `%s`',
    async bundler => {
      options.bundler = bundler

      await libraryGenerator(tree, options)

      expect(viteConfigSpy).not.toHaveBeenCalled()
      expect(nxLibSpy).toHaveBeenCalledWith(
        tree,
        expect.objectContaining({ bundler: bundler ?? 'tsc' }),
      )
    },
  )

  it('runs the vitest config generator if unitTestRunner is `vitest`', async () => {
    options.unitTestRunner = 'vitest'

    await libraryGenerator(tree, options)

    expect(vitestConfigSpy).toHaveBeenCalled()
  })

  it('runs the jest config generator if unitTestRunner is `jest`', async () => {
    options.unitTestRunner = 'jest'

    await libraryGenerator(tree, options)

    expect(jestConfigSpy).toHaveBeenCalled()
  })

  it.each(['none', undefined] satisfies LibrarySchema['unitTestRunner'][])(
    "doesn't run the vitest or jest config generators if unitTestRunner is `%s`",
    async v => {
      options.unitTestRunner = v

      await libraryGenerator(tree, options)

      expect(jestConfigSpy).not.toHaveBeenCalled()
      expect(vitestConfigSpy).not.toHaveBeenCalled()
    },
  )

  it("doesn't run eslint config generator if skipEslint is true", async () => {
    options.skipEslint = true

    await libraryGenerator(tree, options)

    expect(eslintConfigSpy).not.toHaveBeenCalled()
  })

  it("doesn't run cspell config generator if skipCspell is true", async () => {
    options.skipCspell = true

    await libraryGenerator(tree, options)

    expect(cspellConfigSpy).not.toHaveBeenCalled()
  })
})
