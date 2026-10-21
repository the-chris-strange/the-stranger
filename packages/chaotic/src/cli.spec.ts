import { spawn } from 'node:child_process'
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
import { fileURLToPath, URL } from 'node:url'

import { afterEach, expect, it } from 'vitest'

const cli = fileURLToPath(new URL('../dist/bin/chaotic.mjs', import.meta.url))
const directories: string[] = []
const unsorted = '{\n  "b": 1,\n  "a": 2\n}\n'
const sorted = '{\n  "a": 2,\n  "b": 1\n}\n'
const namedInput = '{"a":1,"name":"x"}'
const namedOptions = {
  objectKeys: { overrides: [{ order: ['name'], pathPattern: '' }] },
}

async function directory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'chaotic-cli-'))
  directories.push(path)
  return path
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map(async path => rm(path, { force: true, recursive: true })),
  )
})

async function run(args: string[], options: { cwd?: string; stdin?: string } = {}) {
  const cwd = options.cwd ?? (await directory())
  const env = { ...process.env }
  delete env['FORCE_COLOR']
  return new Promise<{ code: number | null; stderr: string; stdout: string }>(
    (resolve, reject) => {
      const child = spawn(process.execPath, [cli, ...args], { cwd, env, stdio: 'pipe' })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString()
      })
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString()
      })
      child.on('error', reject)
      child.on('close', code => resolve({ code, stderr, stdout }))
      child.stdin.end(options.stdin ?? '')
    },
  )
}

it('Prints help and the package version with a trailing newline', async () => {
  const result = await run(['--help'])
  expect(result.code).toBe(0)
  expect(result.stdout).toMatch(/usage/i)
  for (const option of ['chaotic', '--cwd', '--config-file', '--write', '--check']) {
    expect(result.stdout).toContain(option)
  }
  const version = await run(['--version'])
  const manifest = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { version: string }
  expect(version.code).toBe(0)
  expect(version.stdout).toBe(`${manifest.version}\n`)
})

it.each([
  ['json', '{"b":1,"a":2}', sorted],
  ['yaml', 'b: 1\na: 2\n', 'a: 2\nb: 1\n'],
  ['markdown', '---\nb: 1\na: 2\n---\n# Body\n', '---\na: 2\nb: 1\n---\n# Body\n'],
])('Sorts %s from stdin', async (format, stdin, output) => {
  const result = await run([`--format=${format}`], { stdin })
  expect(result.code).toBe(0)
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
  const result = await run([file], { cwd })
  expect(result.code).toBe(0)
  expect(result.stdout).toBe(output)
  await expect(readFile(file, 'utf8')).resolves.toBe(original)
})

it('Uses an explicit format for a file with an unknown extension', async () => {
  const cwd = await directory()
  const file = join(cwd, 'document.txt')
  await writeFile(file, 'b: 1\na: 2')
  const result = await run(['--format', 'yaml', file], { cwd })
  expect(result.code).toBe(0)
  expect(result.stdout).toBe('a: 2\nb: 1\n')
})

it.each(['--write', '-w'])(
  'Rewrites every file with %s and preserves JSON newline choices',
  async flag => {
    const cwd = await directory()
    const files = ['first.json', 'second.json'].map(name => join(cwd, name))
    await Promise.all(
      files.map(async (file, index) =>
        writeFile(file, index === 0 ? unsorted : unsorted.trimEnd()),
      ),
    )
    const result = await run([flag, ...files], { cwd })
    expect(result).toStrictEqual({ code: 0, stderr: '', stdout: '' })
    await expect(readFile(files[0], 'utf8')).resolves.toBe(sorted)
    await expect(readFile(files[1], 'utf8')).resolves.toBe(sorted.trimEnd())
  },
)

it.skipIf(process.platform === 'win32')(
  'Preserves file permissions while rewriting',
  async () => {
    const cwd = await directory()
    const file = join(cwd, 'document.json')
    await writeFile(file, unsorted)
    await chmod(file, 0o640)
    const result = await run(['--write', file], { cwd })
    expect(result.code).toBe(0)
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
    const result = await run(['--write', file], { cwd })
    expect(result.code).toBe(0)
    expect((await lstat(file)).isSymbolicLink()).toBe(true)
    await expect(readFile(target, 'utf8')).resolves.toBe(sorted)
    await expect(readFile(file, 'utf8')).resolves.toBe(sorted)
  },
)

it('Prints all positional inputs including filenames after the delimiter', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'first.json'), unsorted)
  await writeFile(join(cwd, '-second.json'), unsorted)
  const result = await run(['first.json', '--', '-second.json'], { cwd })
  expect(result.code).toBe(0)
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
  const result = await run(['-k', ...files], { cwd })
  expect(result.code).toBe(1)
  expect(result.stdout).toBe('')
  for (const file of files.slice(0, 2)) {
    expect(result.stderr).toContain(file)
    await expect(readFile(file, 'utf8')).resolves.toBe(unsorted)
  }
  expect(result.stderr).not.toContain(files[2])
  await expect(readFile(files[2], 'utf8')).resolves.toBe(sorted)
})

it('Checks sorted stdin and reports unsorted stdin without output', async () => {
  const unchanged = await run(['--check'], { stdin: sorted })
  expect(unchanged).toStrictEqual({ code: 0, stderr: '', stdout: '' })
  const changed = await run(['--check'], { stdin: unsorted })
  expect(changed.code).toBe(1)
  expect(changed.stdout).toBe('')
  expect(changed.stderr).toContain('<stdin>')
})

it('Resolves relative input and explicit config paths against cwd', async () => {
  const root = await directory()
  const cwd = join(root, 'project')
  await mkdir(cwd)
  await writeFile(join(cwd, 'document.json'), namedInput)
  await writeFile(join(cwd, 'options.json'), JSON.stringify(namedOptions))
  const result = await run(
    ['--cwd', 'project', '--config-file', 'options.json', 'document.json'],
    { cwd: root },
  )
  expect(result.code).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
})

it('Discovers configuration from cwd even when the input is in another directory', async () => {
  const cwd = await directory()
  const other = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), JSON.stringify(namedOptions))
  const file = join(other, 'document.json')
  await writeFile(file, namedInput)
  const result = await run([file], { cwd })
  expect(result.code).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['name', 'a'])
})

it('Ignores configuration in parent directories', async () => {
  const root = await directory()
  const cwd = join(root, 'nested')
  await mkdir(cwd)
  await writeFile(join(root, 'chaotic.config.json'), JSON.stringify(namedOptions))
  const result = await run([], { cwd, stdin: namedInput })
  expect(result.code).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['a', 'name'])
})

it('Skips discovered configuration with no-config while applying CLI indentation', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), '{invalid}')
  const result = await run(['--no-config', '--indent', '0'], { cwd, stdin: namedInput })
  expect(result.code).toBe(0)
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
  const result = await run([], { cwd, stdin: namedInput })
  expect(result.code).toBe(0)
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
  const result = await run(['--indent', '4'], { cwd, stdin: namedInput })
  expect(result.code).toBe(0)
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
  const result = await run([], { cwd, stdin: namedInput })
  expect(result.code).toBe(0)
  expect(Object.keys(JSON.parse(result.stdout) as object)).toStrictEqual(['a', 'name'])
})

it('Accepts string indentation from configuration', async () => {
  const cwd = await directory()
  await writeFile(join(cwd, 'chaotic.config.json'), JSON.stringify({ indent: '\t' }))
  const result = await run([], { cwd, stdin: '{"b":1,"a":2}' })
  expect(result.code).toBe(0)
  expect(result.stdout).toBe('{\n\t"a": 2,\n\t"b": 1\n}\n')
})

it('Accepts the minimum and maximum CLI indentation', async () => {
  for (const indent of [0, 10]) {
    const result = await run(['--indent', String(indent)], { stdin: '{"b":1,"a":2}' })
    expect(result.code).toBe(0)
    expect(result.stdout).toBe(
      indent === 0
        ? '{"a":2,"b":1}\n'
        : `{\n${' '.repeat(indent)}"a": 2,\n${' '.repeat(indent)}"b": 1\n}\n`,
    )
  }
})

it('Rejects missing string option values', async () => {
  for (const option of ['--format', '--cwd', '--config-file', '--indent']) {
    const result = await run([option], { stdin: '{}' })
    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain(option.slice(2))
    expect(result.stdout).toBe('')
  }
})

it('Rejects invalid CLI indentation', async () => {
  for (const value of ['-1', '11', '1.5', 'text']) {
    const result = await run([`--indent=${value}`], { stdin: '{}' })
    expect(result.code).not.toBe(0)
    expect(result.stderr).toMatch(/indent/i)
    expect(result.stdout).toBe('')
  }
})

it.each([
  [['--bogus'], /unknown/i],
  [['--format', 'xml'], /format/i],
  [['--write', '--check'], /write.*check|check.*write/i],
  [['--write'], /stdin|file/i],
  [['--no-config', '--config-file', 'options.json'], /config/i],
])('Rejects invalid options %j', async (args, message) => {
  const result = await run(args, { stdin: '{}' })
  expect(result.code).not.toBe(0)
  expect(result.stderr).toMatch(message)
  expect(result.stdout).toBe('')
})

it('Preflights a malformed second input before writing the first', async () => {
  const cwd = await directory()
  const first = join(cwd, 'first.json')
  const second = join(cwd, 'second.json')
  await writeFile(first, unsorted)
  await writeFile(second, '{invalid}')
  const result = await run(['--write', first, second], { cwd })
  expect(result.code).toBe(1)
  expect(result.stderr).toContain('second.json')
  expect(result.stdout).toBe('')
  await expect(readFile(first, 'utf8')).resolves.toBe(unsorted)
  await expect(readFile(second, 'utf8')).resolves.toBe('{invalid}')
})

it('Preflights a missing second input before writing the first', async () => {
  const cwd = await directory()
  const first = join(cwd, 'first.json')
  const second = join(cwd, 'second.json')
  await writeFile(first, unsorted)
  const result = await run(['--write', first, second], { cwd })
  expect(result.code).toBe(1)
  expect(result.stderr).toContain('second.json')
  expect(result.stdout).toBe('')
  await expect(readFile(first, 'utf8')).resolves.toBe(unsorted)
  await expect(readFile(second, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
})

it('Fails when an explicitly requested configuration file is missing', async () => {
  const result = await run(['--config-file', 'missing.json'], { stdin: '{}' })
  expect(result.code).toBe(1)
  expect(result.stderr).toContain('missing.json')
  expect(result.stdout).toBe('')
})

it.each([
  ['malformed JSON', 'options.json', '{invalid}', /configuration/i],
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
    const result = await run(['--write', '--config-file', name, file], { cwd })
    expect(result.code).toBe(1)
    expect(result.stderr).toMatch(/config/i)
    expect(result.stderr).toMatch(message)
    expect(result.stdout).toBe('')
    await expect(readFile(file, 'utf8')).resolves.toBe(unsorted)
  },
)
