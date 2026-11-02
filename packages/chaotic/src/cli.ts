import { defineCommand, runMain } from 'citty'

import manifest from '../package.json' with { type: 'json' }
import { CHAOTIC_ARGS } from './args.js'
import { runCommand } from './run-command.js'
import { setupCommand } from './setup-command.js'

const command = defineCommand({
  args: CHAOTIC_ARGS,
  meta: {
    description: 'Sort JSON, YAML, and Markdown frontmatter with Ordered.',
    name: 'chaotic',
    version: manifest.version,
  },
  run: runCommand,
  setup: setupCommand,
})

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  await runMain(command, { rawArgs: argv })
  return Number(process.exitCode ?? 0)
}
