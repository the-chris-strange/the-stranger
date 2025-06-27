import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { typescriptEslintConfig } from './typescript-eslint'

describe('typescriptEslintConfig', () => {
  const expected = { rules: { 'bad-code': 'error' } }

  beforeEach(() => {
    vi.doMock('typescript-eslint', async () => {
      return {
        configs: {
          recommended: expected,
        },
      }
    })
  })

  afterEach(() => {
    vi.resetModules()
    vi.unmock('typescript-eslint')
    vi.unmock('@nx/eslint-plugin')
  })

  it("adds tseslint's recommended config when `@nx/eslint-plugin` is not installed", async () => {
    vi.doMock('@nx/eslint-plugin', async () => {
      throw new Error('Module not found')
    })

    const config = await typescriptEslintConfig()

    expect(config).toContainEqual(expected)
  })

  it("doesn't add tseslint's recommended config when `@nx/eslint-plugin` is installed", async () => {
    vi.doMock('@nx/eslint-plugin', async () => {
      return {}
    })

    const config = await typescriptEslintConfig()

    expect(config).not.toContainEqual(expected)
  })
})
