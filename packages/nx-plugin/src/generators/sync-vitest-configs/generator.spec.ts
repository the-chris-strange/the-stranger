import { beforeEach, describe, expect, it } from 'vitest'

import type { Tree } from '@nx/devkit'

import { createTestTree } from '../../test/utils/create-test-tree'
import { syncVitestConfigsGenerator } from './generator'

describe('sync-vitest-configs generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree()
  })

  it('does nothing when no workspace config exists', async () => {
    await expect(syncVitestConfigsGenerator(tree)).resolves.toBeUndefined()
    expect(tree.exists('vitest.workspace.ts')).toBe(false)
    expect(tree.exists('vitest.config.ts')).toBe(false)
  })

  it.each(['mts', 'ts'])(
    'converts a vitest.workspace.%s file to a project config',
    async extension => {
      const workspacePath = `vitest.workspace.${extension}`
      const configPath = `vitest.config.${extension}`
      tree.write(workspacePath, "export default ['packages/**/vitest.config.ts']")

      const result = await syncVitestConfigsGenerator(tree)

      expect(tree.exists(workspacePath)).toBe(false)
      expect(tree.read(configPath, 'utf8')).toContain(
        "import { defineProject } from 'vitest/config'",
      )
      expect(tree.read(configPath, 'utf8')).toContain('export default defineProject({')
      expect(tree.read(configPath, 'utf8')).toContain(
        "projects: ['packages/**/vitest.config.ts']",
      )
      expect(result).toMatchObject({
        outOfSyncMessage: 'The workspace Vitest configuration is out of sync.',
      })
    },
  )

  it('converts a defineWorkspace export and preserves other imports', async () => {
    tree.write(
      'vitest.workspace.ts',
      `import { defineWorkspace, mergeConfig } from 'vitest/config'

const projects = ['packages/*']

export default defineWorkspace(projects)
`,
    )

    await syncVitestConfigsGenerator(tree)

    const contents = tree.read('vitest.config.ts', 'utf8')
    expect(contents).toContain(
      "import { defineProject, mergeConfig } from 'vitest/config'",
    )
    expect(contents).not.toContain('defineWorkspace')
    expect(contents).toContain("const projects = ['packages/*']")
    expect(contents).toContain('projects: projects')
  })

  it('removes a workspace config when a defineProject config already exists', async () => {
    const config = `import { defineProject } from 'vitest/config'

export default defineProject({ test: { projects: ['packages/*'] } })
`
    tree.write('vitest.config.mts', config)
    tree.write('vitest.workspace.ts', "export default ['packages/*']")

    const result = await syncVitestConfigsGenerator(tree)

    expect(tree.exists('vitest.workspace.ts')).toBe(false)
    expect(tree.read('vitest.config.mts', 'utf8')).toBe(config)
    expect(result).toMatchObject({
      outOfSyncDetails: [
        'Removed deprecated vitest.workspace.ts in favor of vitest.config.mts.',
      ],
    })
  })

  it('rejects a conflicting root config', async () => {
    tree.write('vitest.config.ts', 'export default {}')
    tree.write('vitest.workspace.ts', "export default ['packages/*']")

    await expect(syncVitestConfigsGenerator(tree)).rejects.toThrow(
      'vitest.config.ts already exists and does not export defineProject(...)',
    )
    expect(tree.read('vitest.config.ts', 'utf8')).toBe('export default {}')
    expect(tree.exists('vitest.workspace.ts')).toBe(true)
  })
})
