import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'

import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'

import type { ParsedArgs } from 'citty'

import { type ChaoticArgs } from './args.js'
import { runCommand } from './run-command.js'

const unsorted = '{\n  "b": 1,\n  "a": 2\n}\n'
const sorted = '{\n  "a": 2,\n  "b": 1\n}\n'
const namedInput = '{"a":1,"name":"x"}'
const namedOptions = {
  objectKeys: { overrides: [{ order: ['name'], pathPattern: '' }] },
}

let testDir: string

async function directory(): Promise<string> {
  return mkdtemp(testDir)
}

beforeAll(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'chaotic-run-command-'))
})

function context(args: Partial<ParsedArgs<ChaoticArgs>> = {}) {
  return {
    args: { _: [], config: true, ...args } as ParsedArgs<ChaoticArgs>,
    cmd: {},
    rawArgs: [],
  }
}

let exitCode: typeof process.exitCode

beforeEach(() => {
  exitCode = process.exitCode
})

afterEach(() => {
  process.exitCode = exitCode
  vi.restoreAllMocks()
})

afterAll(async () => {
  await rm(testDir, { force: true, recursive: true })
})

async function captureIO(options: { cwd?: string; stdin?: string } = {}) {
  const cwd = options.cwd ?? (await directory())
  let stdout = ''
  let stderr = ''
  vi.spyOn(process, 'cwd').mockReturnValue(cwd)
  vi.spyOn(process, 'stdin', 'get').mockReturnValue(
    Readable.from([options.stdin ?? '']) as typeof process.stdin,
  )
  vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
    stdout += String(chunk)
    return true
  })
  vi.spyOn(process.stderr, 'write').mockImplementation(chunk => {
    stderr += String(chunk)
    return true
  })
  process.exitCode = 0
  return {
    get stderr() {
      return stderr
    },
    get stdout() {
      return stdout
    },
  }
}

it.each([
  ['json', '{"b":1,"a":2}', sorted],
  ['yaml', 'b: 1\na: 2\n', 'a: 2\nb: 1\n'],
  ['markdown', '---\nb: 1\na: 2\n---\n# Body\n', '---\na: 2\nb: 1\n---\n# Body\n'],
] as const)('Sorts %s from stdin', async (format, stdin, output) => {
  const result = await captureIO({ stdin })
  const resultCode = await runCommand(context({ format }))

  expect(resultCode).toBe(0)
  expect(result.stdout).toBe(output)
})

it.each([
  ['json', unsorted, sorted],
  ['yml', 'b: 1\na: 2\n', 'a: 2\nb: 1\n'],
  ['md', '---\nb: 1\na: 2\n---\nText\n', '---\na: 2\nb: 1\n---\nText\n'],
])('Detects .%s files without mutating them', async (extension, original, output) => {
  const cwd = await directory()
  const file = join(cwd, `document.${extension}`)
  await writeFile(file, original)
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: [file] }))
  expect(resultCode).toBe(0)
  expect(result.stdout).toBe(output)
  await expect(readFile(file, 'utf8')).resolves.toBe(original)
})

it('Uses an explicit format for a file with an unknown extension', async () => {
  const cwd = await directory()
  const file = join(cwd, 'document.txt')
  await writeFile(file, 'b: 1\na: 2')
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: [file], format: 'yaml' }))
  expect(resultCode).toBe(0)
  expect(result.stdout).toBe('a: 2\nb: 1\n')
})

it('Rewrites every file and preserves JSON newline choices', async () => {
  const cwd = await directory()
  const files = ['first.json', 'second.json'].map(name => join(cwd, name))
  await Promise.all(
    files.map(async (file, index) =>
      writeFile(file, index === 0 ? unsorted : unsorted.trimEnd()),
    ),
  )
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: files, write: true }))
  expect({ code: resultCode, ...result }).toStrictEqual({
    code: 0,
    stderr: '',
    stdout: '',
  })
  await expect(readFile(files[0], 'utf8')).resolves.toBe(sorted)
  await expect(readFile(files[1], 'utf8')).resolves.toBe(sorted.trimEnd())
})

it.skipIf(process.platform === 'win32')(
  'Preserves file permissions while rewriting',
  async () => {
    const cwd = await directory()
    const file = join(cwd, 'document.json')
    await writeFile(file, unsorted)
    await chmod(file, 0o640)
    await captureIO({ cwd })
    const resultCode = await runCommand(context({ _: [file], write: true }))
    expect(resultCode).toBe(0)
    expect((await stat(file)).mode & 0o777).toBe(0o640)
    await expect(readFile(file, 'utf8')).resolves.toBe(sorted)
  },
)

it.skipIf(process.platform === 'win32')(
  'Rewrites a symlink target without replacing the link',
  async () => {
    const cwd = await directory()
    const target = join(cwd, 'target.json')
    const file = join(cwd, 'document.json')
    await writeFile(target, unsorted)
    await symlink(target, file)
    await captureIO({ cwd })
    const resultCode = await runCommand(context({ _: [file], write: true }))
    expect(resultCode).toBe(0)
    expect((await lstat(file)).isSymbolicLink()).toBe(true)
    await expect(readFile(target, 'utf8')).resolves.toBe(sorted)
    await expect(readFile(file, 'utf8')).resolves.toBe(sorted)
  },
)

it('Prints all positional inputs including filenames starting with a dash', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'first.json'), unsorted)
  await writeFile(join(cwd, '-second.json'), unsorted)
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: ['first.json', '-second.json'] }))
  expect(resultCode).toBe(0)
  expect(result.stdout).toBe(sorted + sorted)
})

it('Checks every input and reports only changed files without rewriting', async () => {
  const cwd = await directory()
  const files = ['first.json', 'second.json', 'sorted.json'].map(name =>
    join(cwd, name),
  )
  await Promise.all(
    files.map(async (file, index) => writeFile(file, index === 2 ? sorted : unsorted)),
  )
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: files, check: true }))
  expect(resultCode).toBe(1)
  expect(result.stdout).toBe('')
  for (const file of files.slice(0, 2)) {
    expect(result.stderr).toContain(file)
    await expect(readFile(file, 'utf8')).resolves.toBe(unsorted)
  }
  expect(result.stderr).not.toContain(files[2])
  await expect(readFile(files[2], 'utf8')).resolves.toBe(sorted)
})

it('Checks sorted stdin and reports unsorted stdin without output', async () => {
  const unchanged = await captureIO({ stdin: sorted })
  const unchangedCode = await runCommand(context({ check: true }))
  expect({ code: unchangedCode, ...unchanged }).toStrictEqual({
    code: 0,
    stderr: '',
    stdout: '',
  })
  const changed = await captureIO({ stdin: unsorted })
  const changedCode = await runCommand(context({ check: true }))
  expect(changedCode).toBe(1)
  expect(changed.stdout).toBe('')
  expect(changed.stderr).toContain('<stdin>')
})

it.each([
  ['lexical', '["a","Z"]', ['Z', 'a']],
  ['locale', '["Z","a"]', ['a', 'Z']],
  ['natural', '["item10","item2"]', ['item2', 'item10']],
])('Applies %s sortType from configuration', async (sortType, stdin, expected) => {
  const cwd = await directory()
  await writeFile(
    join(cwd, 'chaotic.config.json'),
    JSON.stringify({ arrayValues: { sortType } }),
  )
  const result = await captureIO({ cwd, stdin })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(JSON.parse(result.stdout)).toStrictEqual(expected)
})

it.each([
  [
    'priorities',
    'export default { arrayValues: { priority: [".env?"], sortType: "lexical" } }',
    '[".aaa","z",".env?"]',
    ['.env?', '.aaa', 'z'],
  ],
  [
    'regular-expression paths',
    'export default { arrayValues: { sortType: "lexical", overrides: [{ pathPattern: /^users$/, key: "id", sortType: "natural" }] } }',
    '{"users":[{"id":"item10"},{"id":"item2"}]}',
    { users: [{ id: 'item2' }, { id: 'item10' }] },
  ],
])('Supports Ordered %s configuration', async (_name, config, stdin, expected) => {
  const cwd = await directory()
  await writeFile(join(cwd, 'chaotic.config.mjs'), config)
  const result = await captureIO({ cwd, stdin })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(JSON.parse(result.stdout)).toStrictEqual(expected)
})

it('Preserves unlisted key positions from configuration', async () => {
  const cwd = await directory()
  await writeFile(
    join(cwd, 'chaotic.config.json'),
    JSON.stringify({
      objectKeys: {
        overrides: [{ order: ['name'], pathPattern: '' }],
        preserveUnknownKeys: true,
      },
    }),
  )
  const result = await captureIO({ cwd, stdin: '{"z":1,"name":"x","a":2}' })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual([
    'z',
    'name',
    'a',
  ])
})

it('Resolves relative input and explicit config paths against cwd', async () => {
  const root = await directory()
  const cwd = join(root, 'project')
  await mkdir(cwd)
  await writeFile(join(cwd, 'document.json'), namedInput)
  await writeFile(join(cwd, 'options.json'), JSON.stringify(namedOptions))
  const result = await captureIO({ cwd: root })
  const resultCode = await runCommand(
    context({
      '_': ['document.json'],
      'config-file': 'options.json',
      'cwd': 'project',
    }),
  )
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
})

it('Discovers configuration from cwd even when the input is in another directory', async () => {
  const cwd = await directory()
  const other = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), JSON.stringify(namedOptions))
  const file = join(other, 'document.json')
  await writeFile(file, namedInput)
  const result = await captureIO({ cwd })
  const resultCode = await runCommand(context({ _: [file] }))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
})

it('Ignores configuration in parent directories', async () => {
  const root = await directory()
  const cwd = join(root, 'nested')
  await mkdir(cwd)
  await writeFile(join(root, 'chaotic.config.json'), JSON.stringify(namedOptions))
  const result = await captureIO({ cwd, stdin: namedInput })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['a', 'name'])
})

it('Skips discovered configuration with no-config while applying CLI indentation', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), '{invalid}')
  const result = await captureIO({ cwd, stdin: namedInput })
  const resultCode = await runCommand(context({ config: false, indent: '0' }))
  expect(resultCode).toBe(0)
  expect(result.stdout).toBe(`${namedInput}\n`)
})

it.each([
  ['json', JSON.stringify(namedOptions)],
  ['yaml', 'objectKeys:\n  overrides:\n    - pathPattern: ""\n      order: [name]\n'],
  ['js', `module.exports = ${JSON.stringify(namedOptions)}`],
  ['ts', `export default ${JSON.stringify(namedOptions)}`],
  ['mjs', `export default async () => (${JSON.stringify(namedOptions)})`],
  ['cjs', `module.exports = ${JSON.stringify(namedOptions)}`],
])('Discovers a %s config from cwd', async (extension, text) => {
  const cwd = await directory()
  await writeFile(join(cwd, `chaotic.config.${extension}`), text)
  const result = await captureIO({ cwd, stdin: namedInput })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
})

it('Loads extended configuration and lets CLI indentation override inherited options', async () => {
  const cwd = await directory()
  await writeFile(
    join(cwd, 'base.json'),
    JSON.stringify({ ...namedOptions, indent: 1 }),
  )
  await writeFile(
    join(cwd, 'chaotic.config.json'),
    JSON.stringify({ extends: './base.json' }),
  )
  const result = await captureIO({ cwd, stdin: namedInput })
  const resultCode = await runCommand(context({ indent: '4' }))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
  expect(result.stdout).toContain('\n    "name"')
})

it('Replaces inherited override arrays with the local configuration array', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'base.json'), JSON.stringify(namedOptions))
  await writeFile(
    join(cwd, 'chaotic.config.json'),
    JSON.stringify({ extends: './base.json', objectKeys: { overrides: [] } }),
  )
  const result = await captureIO({ cwd, stdin: namedInput })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['a', 'name'])
})

it('Accepts string indentation from configuration', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), JSON.stringify({ indent: '\t' }))
  const result = await captureIO({ cwd, stdin: '{"b":1,"a":2}' })
  const resultCode = await runCommand(context({}))
  expect(resultCode).toBe(0)
  expect(result.stdout).toBe('{\n\t"a": 2,\n\t"b": 1\n}\n')
})

it('Accepts the minimum and maximum CLI indentation', async () => {
  for (const indent of [0, 10]) {
    const result = await captureIO({ stdin: '{"b":1,"a":2}' })
    const resultCode = await runCommand(context({ indent: String(indent) }))
    expect(resultCode).toBe(0)
    expect(result.stdout).toBe(
      indent === 0
        ? '{"a":2,"b":1}\n'
        : `{\n${' '.repeat(indent)}"a": 2,\n${' '.repeat(indent)}"b": 1\n}\n`,
    )
  }
})

it('Rejects invalid CLI indentation', async () => {
  for (const value of ['-1', '11', '1.5', 'text']) {
    const result = await captureIO({ stdin: '{}' })
    await expect(runCommand(context({ indent: value }))).rejects.toThrow(/indent/i)
    expect(result.stdout).toBe('')
  }
})

it.each([
  [{ check: true, write: true }, /write.*check|check.*write/i],
  [{ write: true }, /stdin|file/i],
  [{ 'config': false, 'config-file': 'options.json' }, /config/i],
])('Rejects invalid options %j', async (args, message) => {
  await captureIO({ stdin: '{}' })
  await expect(runCommand(context({ ...args }))).rejects.toThrow(message)
})

it('Preflights a malformed second input before writing the first', async () => {
  const cwd = await directory()
  const first = join(cwd, 'first.json')
  const second = join(cwd, 'second.json')
  await writeFile(first, unsorted)
  await writeFile(second, '{invalid}')
  const result = await captureIO({ cwd })
  await expect(
    runCommand(context({ _: [first, second], write: true })),
  ).rejects.toThrow('second.json')
  expect(result.stdout).toBe('')
  await expect(readFile(first, 'utf8')).resolves.toBe(unsorted)
  await expect(readFile(second, 'utf8')).resolves.toBe('{invalid}')
})

it('Preflights a missing second input before writing the first', async () => {
  const cwd = await directory()
  const first = join(cwd, 'first.json')
  const second = join(cwd, 'second.json')
  await writeFile(first, unsorted)
  const result = await captureIO({ cwd })
  await expect(
    runCommand(context({ _: [first, second], write: true })),
  ).rejects.toThrow('second.json')
  expect(result.stdout).toBe('')
  await expect(readFile(first, 'utf8')).resolves.toBe(unsorted)
  await expect(readFile(second, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
})

it('Fails when an explicitly requested configuration file is missing', async () => {
  const result = await captureIO({ stdin: '{}' })
  await expect(runCommand(context({ 'config-file': 'missing.json' }))).rejects.toThrow(
    'missing.json',
  )
  expect(result.stdout).toBe('')
})

it.each([
  ['malformed JSON', 'options.json', '{invalid}', /configuration/i],
  [
    'invalid sort type',
    'options.json',
    '{"arrayValues":{"sortType":"random"}}',
    /sortType/i,
  ],
  [
    'removed natural flag',
    'options.json',
    '{"arrayValues":{"natural":true}}',
    /natural/i,
  ],
  [
    'removed lexical flag',
    'options.json',
    '{"objectKeys":{"lexical":true}}',
    /lexical/i,
  ],
  [
    'invalid priority values',
    'options.json',
    '{"arrayValues":{"priority":[1]}}',
    /priority/i,
  ],
  [
    'invalid key preservation',
    'options.json',
    '{"objectKeys":{"preserveUnknownKeys":"yes"}}',
    /preserveUnknownKeys/i,
  ],
  [
    'invalid path pattern',
    'options.json',
    '{"arrayValues":{"overrides":[{"pathPattern":1}]}}',
    /pathPattern/i,
  ],
  ['invalid root shape', 'options.json', '[]', /options object/i],
  [
    'invalid nested shape',
    'options.json',
    '{"objectKeys":{"order":"sideways"}}',
    /order/i,
  ],
  ['invalid numeric indentation', 'options.json', '{"indent":11}', /indent/i],
  [
    'runtime exception',
    'options.mjs',
    'export default async () => { throw new Error("config exploded") }',
    /config exploded/,
  ],
  [
    'invalid extended config',
    'options.json',
    '{"extends":"./base.json"}',
    /minValues/i,
  ],
  [
    'missing extended file',
    'options.json',
    '{"extends":"./missing.json"}',
    /missing\.json/,
  ],
  ['cyclic extensions', 'options.json', '{"extends":"./options.json"}', /64|cycle/i],
])(
  'Preserves input files when configuration has %s',
  async (_label, name, text, message) => {
    const cwd = await directory()
    const file = join(cwd, 'document.json')
    await writeFile(file, unsorted)
    await writeFile(join(cwd, name), text)
    await writeFile(join(cwd, 'base.json'), '{"arrayValues":{"minValues":-1}}')
    const result = await captureIO({ cwd })
    const execution = runCommand(
      context({ '_': [file], 'config-file': name, 'write': true }),
    )
    await expect(execution).rejects.toThrow(/config/i)
    await expect(execution).rejects.toThrow(message)
    expect(result.stdout).toBe('')
    await expect(readFile(file, 'utf8')).resolves.toBe(unsorted)
  },
)
