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

import { writeJson } from '../../lib/json'
import { createTestTree } from '../../test/helpers/create-test-tree'
import { addDependencies } from './dependencies'
import { JestConfigSchema } from './schema'

describe('jest-config generator dependency utility', () => {
  let spy: MockInstance
  let tree: Tree
  const options: JestConfigSchema = { project: 'test', skipFormat: true }
  const pkg = 'packages/test/package.json'
  const version = '0.0.0'

  beforeAll(async () => {
    vi.mock('../../lib/add-dependencies.ts')

    tree = createTestTree(options.project)

    writeJson(
      'package.json',
      {
        devDependencies: {
          '@jest/globals': version,
          '@nx/jest': version,
          'jest': version,
          'nx': version,
          'ts-jest': version,
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
    vi.restoreAllMocks()
  })

  it("adds [ 'nx', '@nx/jest', 'jest', 'ts-jest' ]", () => {
    addDependencies(tree, options, pkg)

    const expected = expect.arrayContaining(['nx', '@nx/jest', 'jest', 'ts-jest'])
    expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
  })

  it.each([false, undefined])(
    "adds [ '@jest/globals' ] when `globals` is %s",
    value => {
      options.globals = value
      addDependencies(tree, options, pkg)

      const expected = expect.arrayContaining(['@jest/globals'])
      expect(spy).toHaveBeenCalledExactlyOnceWith(tree, [], expected, pkg)
    },
  )
})
