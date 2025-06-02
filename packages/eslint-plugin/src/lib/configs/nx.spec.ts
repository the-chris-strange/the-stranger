import { afterEach, describe, expect, it, vi } from 'vitest'

import { nxConfig, nxDependencyChecksConfig, nxModuleBoundariesConfig } from './nx'

afterEach(() => {
  vi.resetModules()
  vi.unmock('@nx/eslint-plugin')
})

describe('nxConfig', () => {
  it('returns a config object when "@nx/eslint-plugin" is installed', async () => {
    const expected = { rules: { 'nx/nx-things': 'error' } }
    vi.doMock('@nx/eslint-plugin', async () => {
      return {
        configs: {
          'flat/base': expected,
          'flat/javascript': [expected],
          'flat/typescript': [expected],
        },
      }
    })

    await expect(nxConfig()).resolves.toEqual([
      expected,
      expected,
      expected,
      nxModuleBoundariesConfig,
    ])
  })

  it('returns undefined when "@nx/eslint-plugin" is not installed', async () => {
    vi.doMock('@nx/eslint-plugin', async () => {
      throw new Error('Module not found')
    })

    await expect(nxConfig()).resolves.toBeUndefined()
  })
})

describe('nxDependencyChecksConfig', () => {
  it('returns a config object when "@nx/eslint-plugin" is installed', async () => {
    vi.doMock('@nx/eslint-plugin', async () => {
      return {}
    })

    await expect(nxDependencyChecksConfig()).resolves.toMatchObject({
      files: ['**/*.json'],
      rules: {
        '@nx/dependency-checks': [
          'error',
          {
            ignoredFiles: [
              '{projectRoot}/eslint.config.{js,cjs,mjs}',
              '{projectRoot}/vite.config.{js,ts,mjs,mts}',
              '{projectRoot}/src/**/*.spec.{ts,js,mjs,mts,tsx,jsx}',
            ],
          },
        ],
      },
    })
  })

  it('returns undefined when "@nx/eslint-plugin" is not installed', async () => {
    vi.doMock('@nx/eslint-plugin', async () => {
      throw new Error('Module not found')
    })

    await expect(nxConfig()).resolves.toBeUndefined()
  })

  it('returns undefined when "jsonc-eslint-parser" is not installed', async () => {
    vi.doMock('jsonc-eslint-parser', async () => {
      throw new Error('Module not found')
    })

    await expect(nxDependencyChecksConfig()).resolves.toBeUndefined()

    vi.unmock('jsonc-eslint-parser')
  })
})
