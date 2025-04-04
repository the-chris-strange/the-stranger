import { ExecutorContext } from '@nx/devkit'
import { TypeDocOptions } from 'typedoc'
import { describe, expect, it } from 'vitest'

import executor from './executor'

const options: Partial<TypeDocOptions> = {}

describe.skip('Typedoc Executor', () => {
  it('runs successfully', async () => {
    const output = await executor(options, {} as ExecutorContext)
    expect(output.success).toBe(false)
  })
})
