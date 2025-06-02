import { afterEach, describe, expect, it, vi } from 'vitest'

import { yamlConfig } from './yml'

describe('yamlConfig', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unmock('eslint-plugin-yml')
  })

  it('returns a config object when "eslint-plugin-yml" is installed', async () => {
    const expected = { rules: { 'bad-code': 'error' } }
    vi.doMock('eslint-plugin-yml', async () => {
      return {
        configs: {
          'flat/standard': expected,
        },
      }
    })

    await expect(yamlConfig()).resolves.toEqual(expected)
  })

  it('returns undefined when "eslint-plugin-yml" is not installed', async () => {
    vi.doMock('eslint-plugin-yml', async () => {
      throw new Error('Module not found')
    })

    await expect(yamlConfig()).resolves.toBeUndefined()
  })

  it('returns undefined when "yaml-eslint-parser" is not installed', async () => {
    vi.doMock('yaml-eslint-parser', async () => {
      throw new Error('Module not found')
    })

    await expect(yamlConfig()).resolves.toBeUndefined()
  })
})
