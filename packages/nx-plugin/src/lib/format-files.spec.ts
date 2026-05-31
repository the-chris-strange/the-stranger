import { type formatFiles as nxFormatFiles, type Tree } from '@nx/devkit'
import {
  type MockInstance,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { createTestTree } from '../test/utils/create-test-tree'
import { formatFiles } from './format-files'

describe('formatFiles wrapper', () => {
  let tree: Tree
  let spy: MockInstance<typeof nxFormatFiles>

  beforeAll(async () => {
    spy = vi.spyOn(await import('@nx/devkit'), 'formatFiles')
    tree = createTestTree('test')
  })

  afterEach(() => {
    spy.mockClear()
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
