import { randomUUID } from 'node:crypto'
import { open, readFile, realpath, rename, rm, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { URL } from 'node:url'
import { parseArgs as validateArgs } from 'node:util'

import {
  sortJsonString,
  sortMarkdownFrontmatter,
  sortYamlString,
} from '@the-stranger/ordered'
import { defineCommand, renderUsage, runCommand } from 'citty'

import type { SortJsonStringOptions } from '@the-stranger/ordered'
import type { ArgsDef } from 'citty'

import { resolveConfig } from './config.js'

const args = {
  'check': {
    alias: 'k',
    description: 'Check ordering without writing output or changing files.',
    type: 'boolean',
  },
  'config': {
    default: true,
    description: 'Load configuration; use --no-config for defaults.',
    type: 'boolean',
  },
  'config-file': {
    description: 'Require a configuration file, relative to cwd.',
    type: 'string',
  },
  'cwd': {
    description: 'Working directory for files and configuration.',
    type: 'string',
  },
  'files': {
    description: 'Input files; omit to read stdin.',
    required: false,
    type: 'positional',
  },
  'format': {
    description: 'Input format (default: detect extension, or JSON for stdin).',
    options: ['json', 'yaml', 'markdown'],
    type: 'enum',
  },
  'help': { alias: 'h', description: 'Show usage.', type: 'boolean' },
  'indent': {
    description: 'JSON indentation: an integer from 0 to 10.',
    type: 'string',
  },
  'version': { alias: 'v', description: 'Show version.', type: 'boolean' },
  'write': {
    alias: 'w',
    description: 'Replace input files with sorted output.',
    type: 'boolean',
  },
} as const satisfies ArgsDef

const command = defineCommand({
  args,
  meta: {
    description: 'Sort JSON, YAML, and Markdown frontmatter with Ordered.',
    name: 'chaotic',
  },
  async run({ args: parsed }) {
    if (parsed.help) {
      process.stdout.write(`${await renderUsage(command)}\n`)
      return 0
    }
    if (parsed.version) {
      const pkg = JSON.parse(
        await readFile(new URL('../package.json', import.meta.url), 'utf8'),
      ) as { version: string }
      process.stdout.write(`${pkg.version}\n`)
      return 0
    }
    if (parsed.check && parsed.write)
      throw new Error('--check and --write are mutually exclusive')
    if (parsed.write && parsed._.length === 0)
      throw new Error('--write requires a file argument')
    if (!parsed.config && parsed['config-file'] !== undefined)
      throw new Error('--no-config and --config-file are mutually exclusive')
    const cwd = resolve(parsed.cwd ?? process.cwd())
    if (!(await stat(cwd)).isDirectory())
      throw new Error(`Working directory is not a directory: ${cwd}`)
    const overrides: SortJsonStringOptions = {}
    if (parsed.indent !== undefined) {
      if (!/^\d+$/.test(parsed.indent) || Number(parsed.indent) > 10)
        throw new Error('--indent must be an integer from 0 to 10')
      overrides.indent = Number(parsed.indent)
    }
    let options = overrides
    if (parsed.config) {
      try {
        options = await resolveConfig(cwd, parsed['config-file'], overrides)
      } catch (error) {
        throw new Error(
          `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error },
        )
      }
    }
    // Finish reading and sorting every input before any output or file replacement.
    const inputs = parsed._.length > 0 ? parsed._ : [undefined]
    const documents = await Promise.all(
      inputs.map(async file => {
        try {
          const path =
            file === undefined ? undefined : await realpath(resolve(cwd, file))
          const original =
            path === undefined ? await readStdin() : await readFile(path, 'utf8')
          const extension = extname(file ?? '').toLowerCase()
          const format =
            parsed.format ??
            (['.yaml', '.yml'].includes(extension)
              ? 'yaml'
              : ['.markdown', '.md'].includes(extension)
                ? 'markdown'
                : 'json')
          let sorted =
            format === 'json'
              ? sortJsonString(original, options)
              : format === 'yaml'
                ? sortYamlString(original, options)
                : sortMarkdownFrontmatter(original, options)
          if (format === 'json' && original.endsWith('\n')) sorted += '\n'
          return { label: file ?? '<stdin>', original, path, sorted }
        } catch (error) {
          throw new Error(
            `${file ?? '<stdin>'}: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error },
          )
        }
      }),
    )
    if (parsed.check) {
      const changed = documents.filter(
        document => document.original !== document.sorted,
      )
      for (const document of changed)
        process.stderr.write(`chaotic: would reorder ${document.label}\n`)
      return changed.length > 0 ? 1 : 0
    }
    for (const document of documents) {
      if (parsed.write) {
        if (document.path && document.original !== document.sorted)
          await replaceFile(document.path, document.sorted)
      } else {
        process.stdout.write(
          document.sorted + (document.sorted.endsWith('\n') ? '' : '\n'),
        )
      }
    }
    return 0
  },
  setup({ rawArgs }) {
    // citty deliberately tolerates unknown flags and missing string values.
    // Validate syntax from the same definition before any config or input I/O.
    validateArgs({
      allowNegative: true,
      allowPositionals: true,
      args: rawArgs,
      options: Object.fromEntries(
        Object.entries(args)
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
  },
})

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  try {
    const { result } = await runCommand(command, { rawArgs: argv })
    return (result as number | undefined) ?? 0
  } catch (error) {
    process.stderr.write(
      `chaotic: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return 1
  }
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk as Uint8Array))
  return Buffer.concat(chunks).toString('utf8')
}

async function replaceFile(path: string, contents: string): Promise<void> {
  const temporary = join(dirname(path), `.chaotic-${randomUUID()}`)
  const info = await stat(path)
  try {
    const handle = await open(temporary, 'wx', info.mode)
    try {
      await handle.writeFile(contents, 'utf8')
      await handle.chmod(info.mode)
      await handle.sync()
    } finally {
      await handle.close()
    }
    await rename(temporary, path)
  } finally {
    await rm(temporary, { force: true })
  }
}
