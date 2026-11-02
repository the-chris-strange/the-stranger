import { Readable } from 'node:stream'

import { expect, it, vi } from 'vitest'

import { main } from './cli.js'

it('Runs the CLI', async () => {
  const exitCode = process.exitCode

  vi.spyOn(process, 'stdin', 'get').mockReturnValue(
    Readable.from(['{"b":1,"a":2}']) as typeof process.stdin,
  )
  const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  process.exitCode = 0

  try {
    await expect(main(['--no-config'])).resolves.toBe(0)
    expect(stdout).toHaveBeenCalledWith('{\n  "a": 2,\n  "b": 1\n}\n')
  } finally {
    process.exitCode = exitCode
    vi.restoreAllMocks()
  }
})
