import { type Tree, joinPathFragments } from '@nx/devkit'
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

import { createTestTree } from '../../test/utils/create-test-tree'
import { addEslintDependencies, ESLINT_DEPENDENCIES } from './dependencies'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('addEslintDependencies', () => {
  const projectPath = (...pth: string[]) => joinPathFragments('packages/test', ...pth)
  const pkgJson = projectPath('package.json')
  let tree: Tree
  let spy: MockInstance

  beforeAll(async () => {
    spy = vi.spyOn(
      await import('../../lib/add-dependencies.js'),
      'addDependenciesToProject',
    )
  })

  beforeEach(() => {
    tree = createTestTree('test')
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('adds standardized dependencies to a project package', () => {
    addEslintDependencies(tree, { root: projectPath() })

    expect(spy).toHaveBeenLastCalledWith(tree, [], ESLINT_DEPENDENCIES, pkgJson)
  })

  it('adds standardized dependencies to the workspace package', () => {
    addEslintDependencies(tree, { root: '.' })

    expect(spy).toHaveBeenLastCalledWith(tree, [], ESLINT_DEPENDENCIES, 'package.json')
  })

  it('does not install parser dependencies that are provided by the shared config', () => {
    expect(ESLINT_DEPENDENCIES).not.toContain('jsonc-eslint-parser')
    expect(ESLINT_DEPENDENCIES).toStrictEqual([
      '@the-stranger/eslint-config',
      '@nx/eslint-plugin',
      'eslint',
    ])
  })
})
