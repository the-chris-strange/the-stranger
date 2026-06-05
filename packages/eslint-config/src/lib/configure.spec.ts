import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

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

  it('keeps source rule overrides after TypeScript extends', async () => {
    const config = (await calculateConfig({}, 'src/index.ts')) as {
      rules?: Record<string, unknown>
    }

    expect(config.rules?.['jsdoc/require-jsdoc']).toStrictEqual([0])
  })
})
