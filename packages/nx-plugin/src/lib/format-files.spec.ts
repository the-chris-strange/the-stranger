import { formatFiles as nxFormatFiles, Tree } from '@nx/devkit'
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest'

import { createTestTree } from '../test/helpers/create-test-tree'
import { formatFiles } from './format-files'

describe('formatFiles wrapper', () => {
  let tree: Tree
  let spy: MockInstance<typeof nxFormatFiles>

  beforeEach(async () => {
    tree = createTestTree('test')
    spy = vi.spyOn(await import('@nx/devkit'), 'formatFiles')
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
