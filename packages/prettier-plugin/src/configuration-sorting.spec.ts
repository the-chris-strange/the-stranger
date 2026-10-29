import { format } from 'prettier'
import { describe, expect, it } from 'vitest'

import { sortingConfig } from './index.js'

async function sorted(text: string, filepath: string) {
  return format(text, { ...sortingConfig, filepath })
}

describe('configuration sorting preset', () => {
  it('orders Nx project fields, targets, and tags while preserving command order', async () => {
    const output = JSON.parse(
      await sorted(
        JSON.stringify({
          targets: {
            build: {
              options: { command: 'build' },
              executor: 'run',
              dependsOn: ['z', 'a'],
              cache: true,
            },
          },
          tags: ['z', 'a'],
          name: 'test',
          $schema: 'schema',
        }),
        '/repo/packages/app/project.json',
      ),
    )
    expect(Object.keys(output)).toStrictEqual(['$schema', 'name', 'tags', 'targets'])
    expect(Object.keys(output.targets.build)).toStrictEqual([
      'cache',
      'dependsOn',
      'executor',
      'options',
    ])
    expect(output.tags).toStrictEqual(['a', 'z'])
    expect(output.targets.build.dependsOn).toStrictEqual(['z', 'a'])
  })

  it('places Nx plugin identifiers before options and uses lexical ordering', async () => {
    const output = JSON.parse(
      await sorted(
        '{"plugins":[{"options":{"a":1,"Z":2},"plugin":"nx"}],"targetDefaults":{"build":{"options":{},"executor":"run","cache":true}}}',
        '/repo/nx.json',
      ),
    )
    expect(Object.keys(output.plugins[0])).toStrictEqual(['plugin', 'options'])
    expect(Object.keys(output.plugins[0].options)).toStrictEqual(['Z', 'a'])
    expect(Object.keys(output.targetDefaults.build)).toStrictEqual([
      'cache',
      'executor',
      'options',
    ])
  })

  it('sorts only the designated VS Code arrays, including dotted property names', async () => {
    const output = JSON.parse(
      await sorted(
        '{"other":["z","a"],"eslint.probe":["z","a"],"eslint.validate":["z","a"],"npm.exclude":["z","a"]}',
        String.raw`C:\repo\.vscode\settings.json`,
      ),
    )
    expect(output.other).toStrictEqual(['z', 'a'])
    expect(output['eslint.probe']).toStrictEqual(['a', 'z'])
    expect(output['eslint.validate']).toStrictEqual(['a', 'z'])
    expect(output['npm.exclude']).toStrictEqual(['a', 'z'])
    const extensions = JSON.parse(
      await sorted(
        '{"z":1,"recommendations":["z","a"],"a":2}',
        '/repo/.vscode/extensions.json',
      ),
    )
    expect(Object.keys(extensions)).toStrictEqual(['z', 'recommendations', 'a'])
    expect(extensions.recommendations).toStrictEqual(['a', 'z'])
  })

  it('orders VS Code tasks without reordering tasks or arguments', async () => {
    const output = JSON.parse(
      await sorted(
        '{"tasks":[{"args":["z","a"],"command":"run","label":"z"},{"label":"a"}],"version":"2"}',
        '/repo/.vscode/tasks.json',
      ),
    )
    expect(Object.keys(output)).toStrictEqual(['version', 'tasks'])
    expect(Object.keys(output.tasks[0])).toStrictEqual(['label', 'command', 'args'])
    expect(output.tasks.map((task: { label: string }) => task.label)).toStrictEqual([
      'z',
      'a',
    ])
    expect(output.tasks[0].args).toStrictEqual(['z', 'a'])
  })

  it.each([
    [
      '/repo/cspell.config.yaml',
      'words: [z, a]\nlanguage: en\nversion: 0.2\n',
      'version: 0.2\nlanguage: en\nwords: [a, z]\n',
    ],
    [
      '/repo/.github/dependabot.yml',
      'updates:\n  - schedule: {interval: weekly}\n    package-ecosystem: npm\nversion: 2\n',
      'version: 2\nupdates:\n  - package-ecosystem: npm\n    schedule: { interval: weekly }\n',
    ],
    [
      '/repo/.markdownlint-cli2.yaml',
      'config: {z: 1, a: 2}\nignores: [z, a]\n',
      'ignores: [a, z]\nconfig: { z: 1, a: 2 }\n',
    ],
    [
      '/repo/.yarnrc.yml',
      'z: 1\ninjectEnvironmentFiles: [.aaa, z, .env?, a]\na: 2\n',
      'a: 2\ninjectEnvironmentFiles: [.env?, .aaa, a, z]\nz: 1\n',
    ],
  ])('uses the configuration policy for %s', async (filepath, input, expected) => {
    const output = await sorted(input, filepath)
    expect(output).toBe(expected)
    await expect(sorted(output, filepath)).resolves.toBe(output)
  })

  it('keeps GitHub Actions steps and shell commands in order while sorting their keys', async () => {
    const input =
      'jobs:\n  build:\n    steps:\n      - uses: actions/checkout@v4\n        name: Checkout\n      - env: {z: z, a: a}\n        run: echo hello\n        name: Run\n    runs-on: ubuntu-latest\non:\n  push:\n    paths: [z, a]\nname: CI\n'
    const output = await sorted(input, '/repo/.github/workflows/ci.yml')
    expect(output.indexOf('name: CI')).toBeLessThan(output.indexOf('on:'))
    expect(output.indexOf('runs-on:')).toBeLessThan(output.indexOf('steps:'))
    expect(output.indexOf('name: Checkout')).toBeLessThan(output.indexOf('uses:'))
    expect(output.indexOf('uses:')).toBeLessThan(output.indexOf('name: Run'))
    expect(output.indexOf('run:')).toBeLessThan(output.indexOf('env:'))
    expect(output).toContain('paths: [a, z]')
    await expect(sorted(output, '/repo/.github/workflows/ci.yml')).resolves.toBe(output)
  })

  it('uses ESLint path notation for hyphenated workflow jobs', async () => {
    const output = await sorted(
      'jobs:\n  build-test:\n    steps:\n      - env: {a: b}\n        uses: example/action@v1\n        name: Example\n',
      '/repo/.github/workflows/ci.yml',
    )
    expect(output.indexOf('name: Example')).toBeLessThan(output.indexOf('env:'))
    expect(output.indexOf('env:')).toBeLessThan(output.indexOf('uses:'))
  })

  it('preserves fields omitted from named policies without a catchall', async () => {
    const output = JSON.parse(
      await sorted(
        '{"plugins":[{"include":["packages/**"],"options":{},"exclude":["tools/**"],"plugin":"@nx/js/typescript"}]}',
        '/repo/nx.json',
      ),
    )
    expect(Object.keys(output.plugins[0])).toStrictEqual([
      'include',
      'exclude',
      'plugin',
      'options',
    ])
    const yaml = await sorted(
      'registries: {}\nupdates: []\nenable-beta-ecosystems: true\nversion: 2\n',
      '/repo/.github/dependabot.yml',
    )
    expect(yaml).toBe(
      'registries: {}\nenable-beta-ecosystems: true\nversion: 2\nupdates: []\n',
    )
  })

  it('keeps the preset opt-out and ordinary data sorting available', async () => {
    const input = '{"include":[],"extends":"base"}'
    const output = await format(input, {
      ...sortingConfig,
      orderedSortConfigFiles: false,
      filepath: '/repo/tsconfig.json',
    })
    expect(Object.keys(JSON.parse(output))).toStrictEqual(['extends', 'include'])
    const unsorted = await format(input, {
      ...sortingConfig,
      orderedSort: false,
      filepath: '/repo/tsconfig.json',
    })
    expect(Object.keys(JSON.parse(unsorted))).toStrictEqual(['include', 'extends'])
    await expect(sorted('z: 1\na: 2\n', '/repo/data.yml')).resolves.toBe('a: 2\nz: 1\n')
  })
})
