/* eslint-disable perfectionist/sort-objects -- Fixtures deliberately contain unsorted keys. */
import { format } from 'prettier'
import { describe, expect, it } from 'vitest'

import { config, createSortingPlugin } from './index.js'

async function sorted(text: string, filepath: string, options = {}, rules = {}) {
  return format(text, { filepath, plugins: [createSortingPlugin(rules)], ...options })
}

describe('sorting plugin', () => {
  it('sorts JSON object keys recursively while preserving array order by default', async () => {
    const output = await sorted('{"z":{"b":1,"a":2},"a":["z","a"]}', 'data.json')
    const result = JSON.parse(output)
    expect(Object.keys(result)).toStrictEqual(['a', 'z'])
    expect(Object.keys(result.z)).toStrictEqual(['a', 'b'])
    expect(result.a).toStrictEqual(['z', 'a'])
  })

  it('uses Ordered path rules for named keys and natural object-array sorting', async () => {
    const output = await sorted(
      '{"z":1,"name":"x","users":[{"id":"item10"},{"id":"item2"}]}',
      'data.json',
      {},
      {
        objectKeys: { overrides: [{ pathPattern: '', order: ['name'] }] },
        arrayValues: {
          overrides: [{ pathPattern: 'users', key: 'id', natural: true, minValues: 2 }],
        },
      },
    )
    expect(Object.keys(JSON.parse(output))).toStrictEqual(['name', 'users', 'z'])
    expect(JSON.parse(output).users).toStrictEqual([{ id: 'item2' }, { id: 'item10' }])
  })

  it('can enable scalar array sorting or disable all sorting through Prettier options', async () => {
    expect(
      JSON.parse(await sorted('["z","a"]', 'data.json', { orderedSortArrays: true })),
    ).toStrictEqual(['a', 'z'])
    expect(
      Object.keys(
        JSON.parse(await sorted('{"z":1,"a":2}', 'data.json', { orderedSort: false })),
      ),
    ).toStrictEqual(['z', 'a'])
  })

  it('preserves JSON numbers beyond JavaScript precision and duplicate properties', async () => {
    const output = await sorted('{"z":9007199254740993,"a":1,"a":2}', 'data.json')
    expect(output).toContain('9007199254740993')
    expect(output.match(/"a":/g)).toHaveLength(2)
    expect(JSON.parse(output).a).toBe(2)
  })

  it.each(['jsonc', 'json5'])(
    'preserves %s comments on their properties',
    async parser => {
      const output = await sorted(
        '{\n// zee\n"z":1,\n// aye\n"a":2\n}',
        `data.${parser}`,
        { parser },
      )
      expect(output).toContain('// zee\n')
      expect(output).toContain('// aye\n')
      expect(output.indexOf('// aye')).toBeLessThan(output.indexOf('// zee'))
    },
  )

  it('respects prettier-ignore instead of changing ignored JSON content', async () => {
    const output = await sorted(
      '{\n// prettier-ignore\n"values": {"z":1,"a":2}\n}',
      'data.jsonc',
      { parser: 'jsonc' },
    )
    expect(output).toContain('{"z":1,"a":2}')
  })

  it('sorts YAML maps and retains aliases, comments, and sequence order', async () => {
    const output = await sorted(
      'z: &ref\n  b: 1\n  a: 2\n# alpha\na: *ref\nitems: [z, a]\n',
      'data.yaml',
    )
    expect(output).toContain('# alpha')
    expect(output).toContain('&ref')
    expect(output).toContain('*ref')
    expect(output.indexOf('  a: 2')).toBeLessThan(output.indexOf('  b: 1'))
    expect(output).toContain('[z, a]')
  })

  it('sorts each document in a YAML stream and retains directives and separators', async () => {
    const input =
      '%YAML 1.2\n---\nz: &ref {b: 1, a: 2}\na: *ref\n...\n# second\n---\nz: 2\na: 1\n'
    const output = await sorted(input, 'stream.yaml')
    expect(output).toContain('%YAML 1.2')
    expect(output).toContain('...')
    expect(output).toContain('# second')
    expect(output).toContain('&ref')
    expect(output).toContain('*ref')
    expect(output).toContain('a: 1\nz: 2')
    await expect(sorted(output, 'stream.yaml')).resolves.toBe(output)
  })

  it('leaves ignored YAML maps unsorted', async () => {
    const output = await sorted('# prettier-ignore\nvalue: {z: 1, a: 2}\n', 'data.yaml')
    expect(output).toContain('value: {z: 1, a: 2}')
  })

  it('sorts Markdown frontmatter and uses the ordinary Markdown formatter for the body', async () => {
    const output = await sorted(
      '---\nz: 1\na: 2\n---\n#  Heading\n\nText.\n',
      'notes.md',
    )
    expect(output).toBe('---\na: 2\nz: 1\n---\n\n# Heading\n\nText.\n')
  })

  it('uses normal Prettier formatting for code without changing object semantics', async () => {
    const output = await sorted('const x={z:1,a:2};', 'code.js')
    expect(output).toBe('const x = { z: 1, a: 2 };\n')
  })

  it('applies sorting through the shared default configuration', async () => {
    const output = await format('{"z":1,"a":2}', { ...config, filepath: 'data.json' })
    expect(Object.keys(JSON.parse(output))).toStrictEqual(['a', 'z'])
  })

  it('is idempotent across JSON, YAML, and Markdown', async () => {
    for (const [filepath, text] of [
      ['data.json', '{"z":1,"a":2}'],
      ['data.yaml', 'z: 1\na: 2\n'],
      ['notes.md', '---\nz: 1\na: 2\n---\n#  Title\n'],
    ]) {
      const output = await sorted(text, filepath)
      await expect(sorted(output, filepath)).resolves.toBe(output)
    }
  })

  it('rejects malformed input through the original parsers', async () => {
    await expect(sorted('{invalid}', 'data.json')).rejects.toThrow()
    await expect(sorted('a: [', 'data.yaml')).rejects.toThrow()
  })
})

describe('package.json defaults', () => {
  it('orders known fields, lifecycle scripts, dependencies and deduplicates only designated arrays', async () => {
    const output = await sorted(
      JSON.stringify({
        _private: true,
        custom: { z: 1, a: 2 },
        devDependencies: { zebra: '1', alpha: '1' },
        scripts: { test: 'test', posttest: 'post', pretest: 'pre', build: 'build' },
        keywords: ['z', 'a', 'z'],
        bundledDependencies: ['z', 'a', 'z'],
        workspaces: ['z', 'a'],
        version: '1',
        name: 'example',
      }),
      '/tmp/package.json',
    )
    const value = JSON.parse(output)
    expect(Object.keys(value)).toStrictEqual([
      'name',
      'version',
      'keywords',
      'workspaces',
      'scripts',
      'devDependencies',
      'bundledDependencies',
      'custom',
      '_private',
    ])
    expect(Object.keys(value.scripts)).toStrictEqual([
      'build',
      'pretest',
      'test',
      'posttest',
    ])
    expect(Object.keys(value.devDependencies)).toStrictEqual(['alpha', 'zebra'])
    expect(Object.keys(value.custom)).toStrictEqual(['z', 'a'])
    expect(value.keywords).toStrictEqual(['z', 'a'])
    expect(value.bundledDependencies).toStrictEqual(['a', 'z'])
    expect(value.workspaces).toStrictEqual(['z', 'a'])
  })

  it('preserves export condition precedence and fallback array order', async () => {
    const output = await sorted(
      '{"exports":{"default":"./fallback.js","node":{"default":"./default.js","import":"./import.js","require":"./require.js"},"browser":["./b.js","./a.js"]},"name":"x"}',
      'package.json',
    )
    const value = JSON.parse(output)
    expect(Object.keys(value.exports)).toStrictEqual(['node', 'browser', 'default'])
    expect(Object.keys(value.exports.node)).toStrictEqual([
      'import',
      'require',
      'default',
    ])
    expect(value.exports.browser).toStrictEqual(['./b.js', './a.js'])
  })

  it('supports custom package field ordering and a package-specific opt-out', async () => {
    const text = '{"version":"1","name":"x","description":"y"}'
    expect(
      Object.keys(
        JSON.parse(
          await sorted(text, 'package.json', {
            packageSortOrder: ['description', 'version'],
          }),
        ),
      ),
    ).toStrictEqual(['description', 'version', 'name'])
    expect(
      Object.keys(
        JSON.parse(
          await sorted(text, 'package.json', { orderedSortPackageJson: false }),
        ),
      ),
    ).toStrictEqual(['version', 'name', 'description'])
  })

  it('recognizes Windows paths and does not apply package rules to other JSON files', async () => {
    const text = '{"version":"1","name":"x"}'
    expect(
      Object.keys(
        JSON.parse(
          await sorted(text, String.raw`C:\work\package.json`, { parser: 'json' }),
        ),
      ),
    ).toStrictEqual(['name', 'version'])
    expect(Object.keys(JSON.parse(await sorted(text, 'ordinary.json')))).toStrictEqual([
      'name',
      'version',
    ])
    expect(
      Object.keys(
        JSON.parse(await sorted('{"name":"x","description":"y"}', 'ordinary.json')),
      ),
    ).toStrictEqual(['description', 'name'])
  })
})
