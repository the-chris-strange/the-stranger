import { addProjectConfiguration, readJson, Tree, writeJson } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { PackageJson } from 'nx/src/utils/package-json'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addDependenciesToProject, getWorkspaceVersion } from './add-dependencies'

let tree: Tree
let packageJson: PackageJson

beforeEach(() => {
  tree = createTreeWithEmptyWorkspace()
  addProjectConfiguration(tree, 'test', {
    root: 'packages/test',
    sourceRoot: 'packages/test/src',
  })
  packageJson = {
    dependencies: {
      'some-package': '^1.2.3',
    },
    devDependencies: {
      'another-package': '~4.5.8',
    },
    name: '@tests/root',
    version: '0.0.0',
  }
  writeJson(tree, 'package.json', packageJson)
})

describe('getWorkspaceVersion', () => {
  it('gets the version for a dependency', () => {
    expect(getWorkspaceVersion(tree, 'some-package', packageJson)).toBe('^1.2.3')
  })

  it('throws if the dependency is not found', () => {
    expect(() => {
      getWorkspaceVersion(tree, 'not-there', packageJson)
    }).toThrow()
  })

  it('parses the root package.json if a packageJson object is not provided', () => {
    const spy = vi.spyOn(tree, 'read')

    getWorkspaceVersion(tree, 'some-package')

    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    expect(spy).toHaveBeenCalledWith('package.json', 'utf-8')
  })

  it('does not parse the root package.json if a packageJson object is provided', () => {
    const spy = vi.spyOn(tree, 'read')

    getWorkspaceVersion(tree, 'some-package', packageJson)

    expect(spy).not.toHaveBeenCalled()
  })
})

describe('addDependenciesToProject', () => {
  const projectPackage = 'packages/test/package.json'
  beforeEach(() => {
    writeJson<PackageJson>(tree, projectPackage, {
      name: '@tests/test',
      version: '0.0.0',
    })
  })

  it('adds dependencies to a project', () => {
    addDependenciesToProject(
      tree,
      ['another-package'],
      ['some-package'],
      projectPackage,
    )
    const expected = {
      dependencies: {
        'another-package': '~4.5.8',
      },
      devDependencies: {
        'some-package': '^1.2.3',
      },
    }

    expect(readJson<PackageJson>(tree, projectPackage)).toMatchObject(expected)
  })
})
