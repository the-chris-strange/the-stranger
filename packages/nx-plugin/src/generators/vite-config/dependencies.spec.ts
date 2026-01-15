import { Tree } from '@nx/devkit'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest'

import { writeJson } from '../../lib/json'
import { createTestTree } from '../../test/helpers/create-test-tree'
import { addProjectDeps } from './dependencies'
import { ViteConfigSchema } from './schema'

describe('vite-config generator package dependencies utility', () => {
  let spy: MockInstance
  let tree: Tree
  let options: ViteConfigSchema = { project: 'test' }
  const pkg = 'packages/test/package.json'
  const version = '0.0.0'

  beforeAll(() => {
    vi.mock('../../lib/add-dependencies.ts')

    tree = createTestTree(options.project)

    writeJson(
      'package.json',
      {
        devDependencies: {
          '@nx/vite': version,
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
  })

  beforeEach(async () => {
    options = { project: 'test' }

    writeJson(pkg, { devDependencies: {}, name: '@ws/test', version }, tree)

    spy = vi.spyOn(
      await import('../../lib/add-dependencies.js'),
      'addDependenciesToProject',
    )
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("adds [ 'nx', '@nx/vite' ]", () => {
    addProjectDeps(tree, options, pkg)

    const expected = expect.arrayContaining(['nx', '@nx/vite'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it.each([
    [['vite', 'vite-plugin-dts'], 'includeBuild' as const, true],
    [['vitest', '@vitest/coverage-v8'], 'includeTest' as const, true],
    [['vite-plugin-react'], 'react' as const, true],
  ])(
    'adds %o when `%s` is %s',
    (expectedPkgs, prop, value: ViteConfigSchema[typeof prop]) => {
      options[prop] = value
      addProjectDeps(tree, options, pkg)

      const expected = expect.arrayContaining(expectedPkgs)
      expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
    },
  )

  it("adds [ 'vite-plugin-react-swc' ] when `swc` and `react` are true", () => {
    options.react = true
    options.swc = true
    addProjectDeps(tree, options, pkg)

    const expected = expect.arrayContaining(['vite-plugin-react-swc'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it("doesn't add [ 'vite-plugin-react-swc' ] when `react` is false", () => {
    options.react = false
    options.swc = true
    addProjectDeps(tree, options, pkg)

    const expected = expect.not.arrayContaining(['vite-plugin-react-swc'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })
})
