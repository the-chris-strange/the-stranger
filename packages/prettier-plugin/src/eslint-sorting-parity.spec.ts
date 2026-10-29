import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

import { ESLint } from 'eslint'
import { defineConfig } from 'eslint/config'
import { createJiti } from 'jiti'
import { format, resolveConfig } from 'prettier'
import { describe, expect, it } from 'vitest'

import type { Config } from 'eslint/config'

import { config, sortingConfig } from './index.js'

// Load the sibling source policies so this test catches drift before either package is built.
const jiti = createJiti(import.meta.url)
const { configureJson } = await jiti.import<{
  configureJson: (options: unknown) => Config[]
}>('../../eslint-config/src/lib/json.ts')
const { configureYaml } = await jiti.import<{
  configureYaml: (options: unknown) => Config[]
}>('../../eslint-config/src/lib/yaml.ts')
const { resolveOptions } = await jiti.import<{
  resolveOptions: (options: unknown) => unknown
}>('../../eslint-config/src/lib/options.ts')
const options = resolveOptions({ json: true, yaml: true })
const eslint = new ESLint({
  cwd: import.meta.dirname,
  fix: true,
  overrideConfigFile: true,
  overrideConfig: defineConfig(...configureJson(options), ...configureYaml(options)),
})

const fixtures = [
  [
    'nx.json',
    '{"plugins":[{"include":["z","a"],"options":{"a":1,"Z":2},"exclude":["z","a"],"plugin":"nx"}],"targetDefaults":{"build":{"options":{"z":1,"inputs":[],"cache":true,"a":2},"outputs":[],"executor":"run","cache":true}}}',
  ],
  ['executors.json', '{"z":{"description":"last","a":1},"a":{}}'],
  ['generators.json', '{"z":{},"a":{}}'],
  [
    'project.json',
    '{"targets":{"build":{"options":{"z":1,"inputs":[],"cache":true,"a":2},"executor":"run","dependsOn":["z","a"],"cache":true}},"tags":["z","Z","a"],"name":"example","$schema":"schema"}',
  ],
  [
    'tsconfig.lib.json',
    '{"references":[{"path":"z"},{"path":"a"}],"include":["z","a"],"compilerOptions":{"strict":true,"paths":{"z":["z","a"],"Z":[],"a":[]},"baseUrl":"."},"extends":"base"}',
  ],
  [
    '.vscode/settings.json',
    '{"z":1,"other":["z","a"],"eslint.probe":["z","Z","a"],"eslint.validate":["z","a"],"npm.exclude":["z","a"],"a":2}',
  ],
  ['.vscode/extensions.json', '{"z":1,"recommendations":["z","Z","a"],"a":2}'],
  [
    '.vscode/tasks.json',
    '{"tasks":[{"args":["z","a"],"command":"run","label":"z","options":{"z":1,"a":2}},{"label":"a"}],"version":"2"}',
  ],
  [
    '.vscode/launch.json',
    '{"configurations":[{"request":"launch","name":"z","args":["z","a"]},{"name":"a"}],"version":"0.2.0"}',
  ],
  [
    'cspell.config.yaml',
    'languageSettings:\n  - dictionaries: [z, a]\n    languageId: en\nwords: [z, Z, a]\nlanguage: en\nversion: 0.2\n',
  ],
  [
    '.github/dependabot.yml',
    'registries: {}\nupdates:\n  - schedule: {interval: weekly}\n    package-ecosystem: npm\nenable-beta-ecosystems: true\nversion: 2\n',
  ],
  [
    '.github/workflows/ci.yml',
    'jobs:\n  build:\n    steps:\n      - uses: example/action@v1\n        name: Example\n      - env: {z: z, a: a}\n        run: echo hello\n        name: Run\n    runs-on: ubuntu-latest\non:\n  push:\n    paths: [z, Z, a]\nname: CI\n',
  ],
  [
    '.github/workflows/hyphenated.yml',
    'jobs:\n  build-test:\n    steps:\n      - env: {a: b}\n        uses: example/action@v1\n        name: Example\nname: CI\n',
  ],
  [
    '.markdownlint-cli2.yaml',
    'configs: {z: 1, a: 2}\nconfig: {z: 1, a: 2}\nignores: [z, Z, a]\n',
  ],
  ['.yarnrc.yml', 'z: 1\ninjectEnvironmentFiles: [.aaa, z, .env?, a]\na: 2\n'],
] as const

describe('ESLint and Prettier configuration sorting parity', () => {
  it('matches ESLint when the workspace formats nx.json through its own config', async () => {
    const filepath = fileURLToPath(new URL('../../../nx.json', import.meta.url))
    const workspaceConfig = await resolveConfig(filepath)
    expect(workspaceConfig).toBeTruthy()
    for (const input of [fixtures[0][1], await readFile(filepath, 'utf8')]) {
      const [fixed] = await eslint.lintText(input, { filePath: 'nx.json' })
      expect(fixed.messages).toStrictEqual([])
      const expected = await format(fixed.output ?? input, { ...config, filepath })
      const actual = await format(input, { ...workspaceConfig, filepath })
      await expect(format(actual, { ...config, filepath })).resolves.toBe(expected)
    }
  })

  it.each(fixtures)('produces equivalent output for %s', async (filepath, input) => {
    const [fixed] = await eslint.lintText(input, { filePath: filepath })
    expect(fixed.messages).toStrictEqual([])
    const expected = await format(fixed.output ?? input, { ...config, filepath })
    const actual = await format(input, { ...sortingConfig, filepath })
    expect(actual).toBe(expected)
    await expect(format(actual, { ...sortingConfig, filepath })).resolves.toBe(actual)
  })
})
