import nx from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'

import { formatFiles } from './format-files'

describe('formatFiles wrapper', () => {
  let tree: nx.Tree
  let spy: MockInstance<typeof nx.formatFiles>

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    nx.addProjectConfiguration(tree, 'test', { root: 'packages/test' })
    spy = vi.spyOn(nx, 'formatFiles')
  })

  it("doesn't run the formatter if skipFormat is undefined", async () => {
    await formatFiles(tree, {})
    expect(spy).not.toHaveBeenCalled()
  })

  it("doesn't run the formatter if skipFormat is true", async () => {
    await formatFiles(tree, { skipFormat: true })
    expect(spy).not.toHaveBeenCalled()
  })

  it('runs the formatter if skipFormat is false', async () => {
    await formatFiles(tree, { skipFormat: false })
    expect(spy).toHaveBeenCalled()
  })
})
