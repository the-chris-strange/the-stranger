import { addProjectConfiguration, readJson, Tree, writeJson } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { PackageJson } from 'nx/src/utils/package-json'
import { Tsconfig } from 'tsconfig-type'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { jestConfigGenerator } from './generator'
import { JestConfigSchema } from './schema'

describe('jest config generator', () => {
  let tree: Tree
  let options: JestConfigSchema

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test', { root: 'packages/test' })
    writeJson<Tsconfig>(tree, 'packages/test/tsconfig.spec.json', {
      compilerOptions: { types: [] },
    })

    options = { force: true, project: 'test', skipFormat: true }
  })

  it('runs successfully', async () => {
    await jestConfigGenerator(tree, options)

    expect(tree.exists('packages/test/jest.config.ts')).toBe(true)
  })

  it('removes jest globals from tsconfig', async () => {
    const tsconfig: Tsconfig = {
      compilerOptions: { types: ['jest', 'node'] },
    }
    tree.write('packages/test/tsconfig.spec.json', JSON.stringify(tsconfig))

    await jestConfigGenerator(tree, options)

    expect(
      readJson<PackageJson>(tree, 'packages/test/tsconfig.spec.json'),
    ).toHaveProperty('compilerOptions.types', ['node'])
  })

  it('does not include preset if no preset exists for workspace', async () => {
    const presets = ['js', 'cjs'].map(ext => `jest.preset.${ext}`)
    for (const preset of presets) {
      if (tree.exists(preset)) {
        tree.delete(preset)
      }
    }

    await jestConfigGenerator(tree, options)

    expect(tree.read('packages/test/jest.config.ts', 'utf8')).not.toContain('preset: ')
  })

  it('throws if a config exists and `force` is undefined', async () => {
    delete options.force
    tree.write('packages/test/jest.config.ts', 'jest-config')

    await expect(jestConfigGenerator(tree, options)).rejects.toThrow()
  })

  it('overwrites existing config if `force` is true', async () => {
    options.force = true
    tree.write('packages/test/jest.config.ts', 'jest-config')

    await jestConfigGenerator(tree, options)

    expect(tree.read('packages/test/jest.config.ts', 'utf8')).toContain(
      "import { JestConfigWithTsJest } from 'ts-jest'",
    )
  })

  it('identifies an existing jest preset if one exists', async () => {
    tree.write('jest.preset.cjs', '')
    const spy = vi.spyOn(await import('@nx/devkit'), 'generateFiles')

    await jestConfigGenerator(tree, options)

    expect(spy).toHaveBeenLastCalledWith(
      tree,
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        paths: expect.objectContaining({ jestPreset: '../../jest.preset.cjs' }),
      }),
      expect.any(Object),
    )
  })
})
