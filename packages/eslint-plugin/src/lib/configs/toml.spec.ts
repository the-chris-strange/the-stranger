import { afterEach, describe, expect, it, vi } from 'vitest'

import { tomlConfig } from './toml'

describe('tomlConfig', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unmock('eslint-plugin-toml')
  })

  it('returns a config object when "eslint-plugin-toml" is installed', async () => {
    const expected = { rules: { 'bad-code': 'error' } }
    vi.doMock('eslint-plugin-toml', async () => {
      return {
        configs: {
          'flat/recommended': expected,
        },
      }
    })

    const config = await tomlConfig()

    expect(config).toContainEqual(expected)
    expect(config).toContainEqual(
      expect.objectContaining({
        rules: {
          'toml/array-bracket-newline': ['warn', 'consistent'],
          'toml/array-bracket-spacing': [
            'warn',
            'always',
            {
              arraysInArrays: false,
              objectsInArrays: false,
              singleValue: true,
            },
          ],
          'toml/array-element-newline': ['warn', 'consistent'],
          'toml/comma-style': 'warn',
          'toml/indent': ['warn', 2],
          'toml/inline-table-curly-spacing': 'warn',
          'toml/key-spacing': [
            'warn',
            { afterEqual: true, beforeEqual: true, mode: 'strict' },
          ],
          'toml/no-space-dots': 'warn',
          'toml/no-unreadable-number-separator': 'warn',
          'toml/precision-of-fractional-seconds': ['warn', { max: 3 }],
          'toml/precision-of-integer': ['warn', { maxBit: 64 }],
          'toml/spaced-comment': 'warn',
          'toml/table-bracket-spacing': 'warn',
        },
      }),
    )
  })

  it('returns undefined when "eslint-plugin-toml" is not installed', async () => {
    vi.doMock('eslint-plugin-toml', async () => {
      throw new Error('Module not found')
    })

    await expect(tomlConfig()).resolves.toBeUndefined()
  })

  it('returns undefined when "toml-eslint-parser" is not installed', async () => {
    vi.doMock('toml-eslint-parser', async () => {
      throw new Error('Module not found')
    })

    await expect(tomlConfig()).resolves.toBeUndefined()

    vi.unmock('toml-eslint-parser')
  })
})
