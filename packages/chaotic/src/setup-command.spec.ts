import { parseArgs } from 'citty'
import { expect, it } from 'vitest'

import { type ChaoticArgs, CHAOTIC_ARGS } from './args.js'
import { setupCommand } from './setup-command.js'

function setup(rawArgs: string[]) {
  return setupCommand({
    args: parseArgs<ChaoticArgs>([], CHAOTIC_ARGS),
    cmd: { args: CHAOTIC_ARGS },
    rawArgs,
  })
}

it.each(['--cwd', '--config-file', '--indent', '--format'])(
  'Rejects a missing value for %s',
  option => {
    expect(() => setup([option])).toThrow(option.slice(2))
  },
)

it('Rejects unknown options', () => {
  expect(() => setup(['--bogus'])).toThrow(/unknown/i)
})

it('Accepts aliases, negated flags, and filenames after the delimiter', () => {
  expect(() =>
    setup(['-w', '--no-config', '--format', 'json', '--', '-document.json']),
  ).not.toThrow()
})
