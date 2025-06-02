import { afterEach, describe, expect, it, vi } from 'vitest'

import { cypressConfig } from './cypress'

describe('cypressConfig', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unmock('eslint-plugin-cypress/flat')
  })

  it('returns a config object when "eslint-plugin-cypress" is installed', async () => {
    const expected = { rules: { 'bad-code': 'error' } }
    vi.doMock('eslint-plugin-cypress/flat', async () => {
      return {
        default: {
          configs: {
            recommended: expected,
          },
        },
      }
    })

    await expect(cypressConfig()).resolves.toEqual(expected)
  })

  it('returns undefined when "eslint-plugin-cypress" is not installed', async () => {
    vi.doMock('eslint-plugin-cypress/flat', async () => {
      throw new Error('Module not found')
    })

    await expect(cypressConfig()).resolves.toBeUndefined()
  })
})
