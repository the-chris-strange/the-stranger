import { randomUUID } from 'node:crypto'
import { open, readFile, realpath, rename, rm, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'

import {
  type SortJsonStringOptions,
  sortFrontmatter,
  sortJsonString,
  sortYamlString,
} from '@the-stranger/ordered'

import type { CommandContext } from 'citty'

import type { ChaoticArgs } from './args.js'

import { resolveConfig } from './config.js'

export async function runCommand({ args: parsed }: CommandContext<ChaoticArgs>) {
  if (parsed.check && parsed.write) {
    throw new Error('--check and --write are mutually exclusive')
  }

  if (parsed.write && parsed._.length === 0) {
    throw new Error('--write requires a file argument')
  }

  if (!parsed.config && parsed['config-file'] !== undefined) {
    throw new Error('--no-config and --config-file are mutually exclusive')
  }

  const cwd = resolve(parsed.cwd ?? process.cwd())
  if (!(await stat(cwd)).isDirectory()) {
    throw new Error(`Working directory is not a directory: ${cwd}`)
  }

  const overrides: SortJsonStringOptions = {}
  if (parsed.indent !== undefined) {
    if (!/^\d+$/.test(parsed.indent) || Number(parsed.indent) > 10) {
      throw new Error('--indent must be an integer from 0 to 10')
    }
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
  const documents: InputDescriptor[] =
    parsed._.length === 0
      ? await sortStdin(parsed.format, options)
      : await Promise.all(
          parsed._.map(async f => sortFile(resolve(cwd, f), parsed.format, options)),
        )

  if (parsed.check) {
    const changed = documents.filter(e => e.changed)
    for (const document of changed) {
      process.stderr.write(`chaotic: would reorder ${document.label}\n`)
    }

    process.exitCode = changed.length > 0 ? 1 : 0
    return process.exitCode
  }

  for (const document of documents) {
    if (parsed.write) {
      if (document.path && document.changed) {
        await replaceFile(document.path, document.sorted)
      }
    } else {
      process.stdout.write(
        document.sorted + (document.sorted.endsWith('\n') ? '' : '\n'),
      )
    }
  }
  return 0
}

/**
 * Get the correct sorting function for a given format.
 * @param format the format that {@link @the-stranger/ordered} should use to parse input
 * @returns the sort function
 */
function getSortFunction(format: OrderedFormat) {
  switch (format) {
    case 'json':
      return sortJsonString
    case 'markdown':
      return sortFrontmatter
    case 'yaml':
      return sortYamlString
  }
}

/**
 * Infer the format of the file for sorting rules.
 * @param ext the file extension, as returned from {@link extname}
 * @returns the format of the file
 */
function inferFormatFromExt(ext: string): OrderedFormat {
  switch (ext) {
    case '.markdown':
    case '.md':
      return 'markdown'
    case '.yaml':
    case '.yml':
      return 'yaml'
    default:
      return 'json'
  }
}

/**
 * Sort a file in place.
 * @param path the file path
 * @param content the new file content
 */
async function replaceFile(path: string, content: string): Promise<void> {
  const temporary = join(dirname(path), `.chaotic-${randomUUID()}`)
  const info = await stat(path)

  try {
    const handle = await open(temporary, 'wx', info.mode)
    try {
      await handle.writeFile(content, 'utf8')
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

function sort(value: string, format: OrderedFormat, options?: SortJsonStringOptions) {
  const sort = getSortFunction(format)
  const f = format === 'json' && value.endsWith('\n') ? '\n' : ''
  return sort(value, options) + f
}

async function sortFile(
  filepath: string,
  format?: OrderedFormat,
  options?: SortJsonStringOptions,
): Promise<InputDescriptor> {
  try {
    const path = await realpath(filepath)
    format ??= inferFormatFromExt(extname(path).toLowerCase())
    const original = await readFile(path, 'utf8')
    const sorted = sort(original, format, options)

    return {
      changed: original !== sorted,
      label: filepath,
      original,
      path,
      sorted,
    }
  } catch (error) {
    throw new Error(
      `${filepath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }
}

async function sortStdin(
  format?: OrderedFormat,
  options?: SortJsonStringOptions,
): Promise<InputDescriptor[]> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk as Uint8Array))
  }

  const original = Buffer.concat(chunks).toString('utf8')
  const sorted = sort(original, format ?? 'json', options)

  return [
    {
      changed: original !== sorted,
      label: '<stdin>',
      original,
      path: '--',
      sorted,
    },
  ]
}

interface InputDescriptor {
  changed: boolean
  label: string
  original: string
  path: string
  sorted: string
}

type OrderedFormat = 'json' | 'markdown' | 'yaml'
