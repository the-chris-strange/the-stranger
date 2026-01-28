import { Tree } from '@nx/devkit'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest'

import { createTestTree } from '../../test/helpers/create-test-tree'
import libraryGenerator from './generator'
import { LibrarySchema } from './schema'

describe('library generator', () => {
  let tree: Tree
  let options: LibrarySchema
  let viteConfigSpy: MockInstance
  let cspellConfigSpy: MockInstance
  let jestConfigSpy: MockInstance
  let eslintConfigSpy: MockInstance

  beforeAll(async () => {
    vi.mock('@nx/js')
    vi.mock('./dependencies.ts')
    vi.mock('./manifest.ts')
    vi.mock('../vite-config/generator.ts')
    vi.mock('../cspell-config/generator.ts')
    vi.mock('../jest-config/generator.ts')
    vi.mock('../eslint-config/generator.ts')

    // @ts-expect-error ts compiler expects named import instead of default
    viteConfigSpy = vi.spyOn(await import('../vite-config/generator.js'), 'default')
    // @ts-expect-error ts compiler expects named import instead of default
    cspellConfigSpy = vi.spyOn(await import('../cspell-config/generator.js'), 'default')
    // @ts-expect-error ts compiler expects named import instead of default
    jestConfigSpy = vi.spyOn(await import('../jest-config/generator.js'), 'default')
    // @ts-expect-error ts compiler expects named import instead of default
    eslintConfigSpy = vi.spyOn(await import('../eslint-config/generator.js'), 'default')
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
    vi.restoreAllMocks()
  })

  it('runs the vite config generator if bundler is "vite"', async () => {
    options.bundler = 'vite'

    await libraryGenerator(tree, options)

    expect(viteConfigSpy).toHaveBeenCalledExactlyOnceWith(
      tree,
      expect.objectContaining({ includeBuild: true }),
    )
  })

  it('runs the vite config generator if unitTestRunner is "vitest"', async () => {
    options.unitTestRunner = 'vitest'

    await libraryGenerator(tree, options)

    expect(viteConfigSpy).toHaveBeenCalledExactlyOnceWith(
      tree,
      expect.objectContaining({ includeTest: true }),
    )
  })

  it("doesn't run the vite config generator if not using vite or vitest", async () => {
    options.bundler = 'tsc'
    options.unitTestRunner = 'jest'

    await libraryGenerator(tree, options)

    expect(viteConfigSpy).not.toHaveBeenCalled()
  })

  it('runs the jest config generator if unitTestRunner is "jest"', async () => {
    options.unitTestRunner = 'jest'

    await libraryGenerator(tree, options)

    expect(jestConfigSpy).toHaveBeenCalled()
  })

  it("doesn't run vite or jest config generators if skipTestConfig is true", async () => {
    options.skipTestConfig = true
    await libraryGenerator(tree, options)

    expect(viteConfigSpy).not.toHaveBeenCalled()
    expect(jestConfigSpy).not.toHaveBeenCalled()
  })

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
