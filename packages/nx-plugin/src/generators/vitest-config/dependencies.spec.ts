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

import { writeJson } from '../../lib/json'
import { createTestTree } from '../../test/utils/create-test-tree'
import { addDependencies } from './dependencies'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('vitest-config generator package dependencies utility', () => {
  let spy: MockInstance
  let tree: Tree
  const pkg = 'packages/test/package.json'
  const version = '0.0.0'

  beforeAll(async () => {
    tree = createTestTree('test')

    writeJson(
      'package.json',
      {
        devDependencies: {
          '@nx/vitest': version,
          '@vitest/coverage-v8': version,
          'nx': version,
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
    writeJson(pkg, { devDependencies: {}, name: '@ws/test', version }, tree)
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('adds required vitest dependencies', () => {
    addDependencies(tree, { project: 'test' }, pkg)

    expect(spy).toHaveBeenCalledExactlyOnceWith(
      tree,
      [],
      expect.arrayContaining(['nx', '@nx/vitest', 'vitest']),
      pkg,
    )
  })

  it('adds required dependencies if "coverageProvider" is "v8"', () => {
    addDependencies(tree, { coverageProvider: 'v8', project: 'test' }, pkg)

    expect(spy).toHaveBeenCalledExactlyOnceWith(
      tree,
      [],
      expect.arrayContaining(['@vitest/coverage-v8']),
      pkg,
    )
  })
})
