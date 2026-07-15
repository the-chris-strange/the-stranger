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

import type { ViteConfigSchema } from './schema'

import { writeJson } from '../../lib/json'
import { createTestTree } from '../../test/utils/create-test-tree'
import { addDependencies } from './dependencies'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('vite-config generator package dependencies utility', () => {
  let spy: MockInstance
  let tree: Tree
  let options: ViteConfigSchema
  const pkg = 'packages/test/package.json'
  const version = '0.0.0'

  beforeAll(async () => {
    tree = createTestTree('test')

    writeJson(
      'package.json',
      {
        devDependencies: {
          '@nx/vite': version,
          '@nx/vitest': version,
          '@vitest/coverage-v8': version,
          'nx': version,
          'vite': version,
          'vite-plugin-dts': version,
          'vite-plugin-react': version,
          'vite-plugin-react-swc': version,
          'vitest': version,
        },
        name: 'ws',
        version,
      },
      tree,
    )

    spy = vi.spyOn(
      await import('../../lib/add-dependencies.js'),
      'addDependenciesToProject',
    )
  })

  beforeEach(() => {
    options = { project: 'test', skipFormat: true }

    writeJson(pkg, { devDependencies: {}, name: '@ws/test', version }, tree)
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('adds required dependencies', () => {
    addDependencies(tree, options, pkg)

    const expected = expect.arrayContaining([
      'nx',
      '@nx/vite',
      'vite',
      'vite-plugin-dts',
    ])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it("adds [ 'vite-plugin-react' ] when `react` is true", () => {
    options.react = true
    options.swc = false
    addDependencies(tree, options, pkg)

    const expected = expect.arrayContaining(['vite-plugin-react'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it("adds [ 'vite-plugin-react-swc' ] when `swc` and `react` are true", () => {
    options.react = true
    options.swc = true
    addDependencies(tree, options, pkg)

    const expected = expect.arrayContaining(['vite-plugin-react-swc'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it("doesn't add [ 'vite-plugin-react-swc' ] when `react` is false", () => {
    options.react = false
    options.swc = true
    addDependencies(tree, options, pkg)

    const expected = expect.not.arrayContaining(['vite-plugin-react-swc'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })
})
