import { parseArgs as validateArgs } from 'node:util'

import type { CommandContext } from 'citty'

import { type ChaoticArgs, CHAOTIC_ARGS } from './args.js'

export function setupCommand({ rawArgs }: CommandContext<ChaoticArgs>) {
  // citty deliberately tolerates unknown flags and missing string values.
  // Validate syntax from the same definition before any config or input I/O.
  validateArgs({
    allowNegative: true,
    allowPositionals: true,
    args: rawArgs,
    options: Object.fromEntries(
      Object.entries(CHAOTIC_ARGS)
        .filter(([, arg]) => arg.type !== 'positional')
        .map(([name, arg]) => [
          name,
          {
            ...('alias' in arg ? { short: arg.alias } : {}),
            type: arg.type === 'boolean' ? 'boolean' : 'string',
          },
        ]),
    ),
    strict: true,
  })
}
