import { type Tree, readJson, readNxJson, writeJson } from '@nx/devkit'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { VitestConfigSchema } from './schema'

import { createTestTree } from '../../test/utils/create-test-tree'
import { vitestConfigGenerator } from './generator'

vi.mock(import('./tsconfig.ts'))
vi.mock(import('./dependencies.ts'))

describe('vitest config generator', () => {
  let tree: Tree
  let options: VitestConfigSchema

  beforeEach(() => {
    options = {
      force: true,
      project: 'test',
      skipFormat: true,
    }
    tree = createTestTree('test')
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('creates a config by default', async () => {
    await vitestConfigGenerator(tree, options)
    expect(tree.exists('packages/test/vitest.config.mts')).toBe(true)
  })

  it('registers the Vitest sync generator on the inferred test target', async () => {
    await vitestConfigGenerator(tree, options)

    expect(
      readJson(tree, 'packages/test/project.json').targets.test.syncGenerators,
    ).toStrictEqual(['@the-stranger/nx-plugin:sync-vitest-configs'])
  })

  it('does not register the Vitest sync generator twice', async () => {
    await vitestConfigGenerator(tree, options)
    await vitestConfigGenerator(tree, options)

    expect(
      readJson(tree, 'packages/test/project.json').targets.test.syncGenerators,
    ).toStrictEqual(['@the-stranger/nx-plugin:sync-vitest-configs'])
  })

  it('registers the sync generator globally when project.json is unavailable', async () => {
    tree.delete('packages/test/project.json')
    writeJson(tree, 'packages/test/package.json', { name: 'test' })
    writeJson(tree, 'package.json', {
      ...readJson<Record<string, unknown>>(tree, 'package.json'),
      workspaces: ['packages/*'],
    })

    await vitestConfigGenerator(tree, options)

    expect(readNxJson(tree)?.sync?.globalGenerators).toStrictEqual([
      '@the-stranger/nx-plugin:sync-vitest-configs',
    ])
  })

  it("doesn't generate tsconfigs if skipTsconfigs is true", async () => {
    options.skipTsconfigs = true
    const spy = vi.spyOn(await import('./tsconfig.js'), 'generateTsc')
    spy.mockReset()
    await vitestConfigGenerator(tree, options)
    expect(spy).not.toHaveBeenCalled()
  })
})
