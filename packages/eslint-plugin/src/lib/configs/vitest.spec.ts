import { afterEach, describe, expect, it, vi } from 'vitest'

import { vitestConfig } from './vitest'

describe('vitestConfig', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unmock('@vitest/eslint-plugin')
  })

  it('returns a config object when "@vitest/eslint-plugin" is installed', async () => {
    const expected = { rules: { 'bad-code': 'error' } }
    vi.doMock('@vitest/eslint-plugin', async () => {
      return {
        default: {
          configs: {
            recommended: expected,
          },
        },
      }
    })

    const config = await vitestConfig()

    expect(config).toContainEqual(expected)
    expect(config).toContainEqual(
      expect.objectContaining({
        rules: {
          'vitest/consistent-test-it': ['error', { fn: 'it' }],
          'vitest/prefer-hooks-in-order': 'warn',
          'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
        },
      }),
    )
  })

  it('returns undefined when "@vitest/eslint-plugin" is not installed', async () => {
    vi.doMock('@vitest/eslint-plugin', async () => {
      throw new Error('Module not found')
    })

    await expect(vitestConfig()).resolves.toBeUndefined()
  })
})
