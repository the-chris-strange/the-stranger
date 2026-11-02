import { parseArgs } from 'citty'
import { expect, it } from 'vitest'

import { type ChaoticArgs, CHAOTIC_ARGS } from './args.js'

it('Rejects an invalid format', () => {
  expect(() => parseArgs<ChaoticArgs>(['--format', 'xml'], CHAOTIC_ARGS)).toThrow(
    /format/i,
  )
})
