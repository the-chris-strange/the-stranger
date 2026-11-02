import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it, vi } from 'vitest'

import type { Options } from './options.js'

import { configure } from './configure.js'
import { moduleBoundaries } from './nx.js'

async function calculateConfig(options: Options, filePath: string) {
  const eslint = new ESLint({
    cwd: import.meta.dirname,
    overrideConfig: configure(options),
    overrideConfigFile: true,
  })

  const config: unknown = await eslint.calculateConfigForFile(filePath)
  return config
}

describe('configure', () => {
  it.each([
    ['const neverUsed = 1\n', 'no-unused-vars'],
    ['42;\n', 'no-unused-expressions'],
    ['new Array(1, 2)\n', 'no-array-constructor'],
  ])(
    'reports %s using core rule %s without requiring the TypeScript plugin',
    async (source, rule) => {
      const eslint = new ESLint({
        overrideConfig: configure({ source: { jsdoc: false, ts: false } }),
        overrideConfigFile: true,
      })
      const [result] = await eslint.lintText(source, {
        filePath: 'unused.js',
      })

      expect(result.messages.some(message => message.ruleId === rule)).toBe(true)
    },
  )
  it.each([
    [false, true],
    [true, false],
  ])(
    'keeps configurations independent when type checking is created in order %j',
    async (...order) => {
      vi.resetModules()

      const { configure: createConfig } = await import('./configure.js')
      let before: unknown
      const configurations = order.map(typeChecked => {
        const configuration = createConfig({
          source: { jsdoc: false, ts: { typeChecked } },
        })
        if (!typeChecked) {
          before = structuredClone(configuration.map(config => config.rules))
        }
        return configuration
      })
      const untyped = configurations[order.indexOf(false)]

      createConfig()

      expect(untyped.map(config => config.rules)).toStrictEqual(before)

      for (const [index, overrideConfig] of configurations.entries()) {
        const eslint = new ESLint({ overrideConfig, overrideConfigFile: true })
        const effective = await eslint.calculateConfigForFile('standalone.ts')

        expect(effective?.rules?.['@typescript-eslint/no-deprecated']).toStrictEqual(
          order[index] ? [1] : undefined,
        )
      }
    },
  )

  it.each(['ts', 'tsx'])(
    'lints standalone %s without a TypeScript project when type checking is disabled',
    async extension => {
      const cwd = await mkdtemp(join(tmpdir(), 'eslint-config-standalone-'))
      try {
        const eslint = new ESLint({
          cwd,
          overrideConfig: configure({
            source: {
              jsdoc: false,
              react: { typeChecked: false, typescript: true },
              ts: { typeChecked: false },
            },
          }),
          overrideConfigFile: true,
        })
        const [result] = await eslint.lintText('export const count: number = 1\n', {
          filePath: `standalone.${extension}`,
        })

        expect(result.fatalErrorCount).toBe(0)
      } finally {
        await rm(cwd, { force: true, recursive: true })
      }
    },
  )

  it.each(['standalone.ts', 'standalone.cjs'])(
    'disables TypeScript configuration for %s even when other TypeScript switches are true',
    async filePath => {
      const effective = (await calculateConfig(
        { source: { ts: { strict: true, typeChecked: true, typescript: false } } },
        filePath,
      )) as { rules?: Record<string, [number, ...unknown[]]> }

      expect(
        Object.entries(effective.rules ?? {})
          .filter(
            ([rule, [severity]]) =>
              rule.startsWith('@typescript-eslint/') && severity !== 0,
          )
          .map(([rule]) => rule),
      ).toStrictEqual([])
    },
  )

  it.each([
    ['.github/workflows/ci.yml', 'jobs: {}\nname: CI\n', 'name: CI\njobs: {}\n'],
    [
      '.github/dependabot.yml',
      'updates: []\nversion: 2\n',
      'version: 2\nupdates: []\n',
    ],
  ])('applies YAML sorting to %s', async (filePath, input, expected) => {
    const overrideConfig = configure({ source: false, yaml: { sort: true } })
    const options = {
      cwd: import.meta.dirname,
      overrideConfig,
      overrideConfigFile: true as const,
    }
    const [reported] = await new ESLint(options).lintText(input, { filePath })
    const [fixed] = await new ESLint({ ...options, fix: true }).lintText(input, {
      filePath,
    })

    expect(reported.messages.some(message => message.ruleId === 'yml/sort-keys')).toBe(
      true,
    )
    expect(fixed.output).toBe(expected)
    expect(fixed.messages).toStrictEqual([])
  })

  it.each([
    ['JavaScript source', {}, 'src/index.js'],
    ['TypeScript source', {}, 'src/index.ts'],
    [
      'React TypeScript source',
      { source: { react: { typeChecked: true, typescript: true } } },
      'src/component.tsx',
    ],
    [
      'Vitest unit test',
      { tests: { unitTestRunner: 'vitest' } },
      'src/lib/foo.spec.ts',
    ],
    ['Jest unit test', { tests: { unitTestRunner: 'jest' } }, 'src/lib/foo.spec.ts'],
    [
      'Playwright e2e test',
      { tests: { e2eTestRunner: 'playwright' } },
      'e2e/foo.spec.ts',
    ],
    ['Nx JSON config', { nx: true }, 'nx.json'],
    ['custom Nx config array', { nx: [moduleBoundaries()] }, 'src/index.ts'],
    ['YAML config', {}, 'config.yml'],
    ['TOML config', { toml: true }, 'config.toml'],
  ] satisfies [string, Options, string][])(
    'calculates config for %s without unresolved plugin rules',
    async (_name, options, filePath) => {
      await expect(calculateConfig(options, filePath)).resolves.toBeTruthy()
    },
  )

  it.each(['project.json', 'config.yaml'])(
    'keeps data linting but requires an explicit sorting opt-in for %s',
    async filePath => {
      const normal = (await calculateConfig({}, filePath)) as {
        rules?: Record<string, unknown>
      }
      const enabled = (await calculateConfig(
        { json: true, yaml: true },
        filePath === 'config.yaml' ? 'cspell.config.yaml' : filePath,
      )) as { rules?: Record<string, unknown> }

      expect(normal).toBeTruthy()
      expect(normal.rules?.['jsonc/sort-keys']).toBeUndefined()
      expect(normal.rules?.['yml/sort-keys']).toBeUndefined()
      expect(
        enabled.rules?.[
          filePath.endsWith('.json') ? 'jsonc/sort-keys' : 'yml/sort-keys'
        ],
      ).toBeTruthy()
      await expect(
        calculateConfig({ json: false, yaml: false }, filePath),
      ).resolves.toBeUndefined()
    },
  )

  it('keeps source rule overrides after TypeScript extends', async () => {
    const config = (await calculateConfig({}, 'src/index.ts')) as {
      rules?: Record<string, unknown>
    }

    expect(config.rules?.['jsdoc/require-jsdoc']).toStrictEqual([0])
  })
})
