import {
  addProjectConfiguration,
  joinPathFragments,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
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

import {
  addEslintDependencies,
  ESLINT_DEPENDENCIES,
  JEST_DEPENDENCIES,
  VITEST_DEPENDENCIES,
} from './dependencies'

describe('addEslintDependencies', () => {
  const projectPath = (...pth: string[]) => joinPathFragments('packages/test', ...pth)
  const project: ProjectConfiguration = { root: projectPath() }
  const pkgJson = projectPath('package.json')
  let tree: Tree
  let spy: MockInstance

  beforeAll(() => {
    vi.mock('../../lib/add-dependencies.ts')
  })

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test', project)
    spy = vi.spyOn(
      await import('../../lib/add-dependencies'),
      'addDependenciesToProject',
    )
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('adds default dependencies if no relevant configs are present', () => {
    addEslintDependencies(tree, project)

    expect(spy).toHaveBeenLastCalledWith(tree, [], ESLINT_DEPENDENCIES, pkgJson)
  })

  it.each([
    ['vitest', VITEST_DEPENDENCIES],
    ['jest', JEST_DEPENDENCIES],
  ])('adds the correct dependencies if `unitTestRunner` is %s', (runner, deps) => {
    addEslintDependencies(tree, { ...project, unitTestRunner: runner as any })

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      [],
      expect.arrayContaining(deps),
      pkgJson,
    )
  })

  it('adds jest dependencies if jest config is detected', () => {
    tree.write(projectPath('jest.config.ts'), '')

    addEslintDependencies(tree, project)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      [],
      expect.arrayContaining(JEST_DEPENDENCIES),
      pkgJson,
    )
  })

  it('adds vitest dependencies if vite config is detected', () => {
    tree.write(projectPath('vite.config.ts'), '')

    addEslintDependencies(tree, project)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      [],
      expect.arrayContaining(VITEST_DEPENDENCIES),
      pkgJson,
    )
  })

  it('adds vitest dependencies if vitest config is detected', () => {
    tree.write(projectPath('vitest.config.mts'), '')

    addEslintDependencies(tree, project)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      [],
      expect.arrayContaining(VITEST_DEPENDENCIES),
      pkgJson,
    )
  })
})
