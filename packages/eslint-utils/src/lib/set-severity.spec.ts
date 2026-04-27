import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ConfigWithExtends } from './types.js'

import { RuleLevels } from './rule-levels.js'
import { setSeverity } from './set-severity.js'

describe('setSeverity', () => {
  const matcher = () => true
  let levels: RuleLevels
  let config: ConfigWithExtends

  beforeEach(() => {
    levels = new RuleLevels('warn')

    config = {
      extends: [
        {
          rules: {
            '@bar/the-bar-rule': 'error',
            '@foo/no-bad-code': ['error', { allowBadCode: true }],
            'eggs-must-have-pepper': 'error',
            'spam/must-have-eggs': 'error',
            'spam/must-have-rice': 'off',
          },
        },
      ],
      files: ['*.*'],
      rules: {
        '@eslint-plugin-plugin-eslint/no-bad-code': 'error',
        '@foo/no-good-code': 'off',
        '@that-plugin/this-rule': [
          'error',
          { optionA: true, optionB: 42, optionC: 'foo' },
        ],
        '@this-plugin/that-rule': 2,
      },
    }
  })

  it('leaves the config alone if it has no rules', () => {
    delete config.rules
    delete config.extends
    const spy = vi.spyOn(Object, 'entries')

    setSeverity(config, levels, matcher)

    expect(spy).not.toHaveBeenCalled()
  })

  it('sets the severity of a config', () => {
    expect(setSeverity(config, levels, matcher).rules).toMatchObject({
      '@eslint-plugin-plugin-eslint/no-bad-code': 'warn',
      '@foo/no-good-code': 'off',
      '@that-plugin/this-rule': [
        'warn',
        { optionA: true, optionB: 42, optionC: 'foo' },
      ],
      '@this-plugin/that-rule': 1,
    })
  })

  it('leaves disabled rules alone', () => {
    expect(setSeverity(config, levels, matcher).rules).toHaveProperty(
      '@foo/no-good-code',
      'off',
    )
  })

  it('modifies `extends` property, if present', () => {
    expect(setSeverity(config, levels, matcher).extends?.[0]).toMatchObject({
      rules: {
        '@bar/the-bar-rule': 'warn',
        '@foo/no-bad-code': ['warn', { allowBadCode: true }],
        'eggs-must-have-pepper': 'warn',
        'spam/must-have-eggs': 'warn',
        'spam/must-have-rice': 'off',
      },
    })
  })

  it('modifies disabled rules if `force` is specified', () => {
    expect(setSeverity(config, levels, matcher, true).rules).toMatchObject({
      '@eslint-plugin-plugin-eslint/no-bad-code': 'warn',
      '@foo/no-good-code': 'warn',
      '@that-plugin/this-rule': [
        'warn',
        { optionA: true, optionB: 42, optionC: 'foo' },
      ],
      '@this-plugin/that-rule': 1,
    })
  })

  describe('given an array of configs', () => {
    let config: ConfigWithExtends[]

    beforeEach(() => {
      config = [
        {
          files: ['*.*'],
          rules: {
            '@eslint-plugin-plugin-eslint/no-bad-code': 'error',
            '@foo/no-good-code': 'off',
            '@that-plugin/this-rule': [
              'error',
              { optionA: true, optionB: 42, optionC: 'foo' },
            ],
            '@this-plugin/that-rule': 2,
          },
        },
        {
          extends: [
            {
              rules: {
                '@bar/the-bar-rule': 'error',
                '@foo/no-bad-code': ['error', { allowBadCode: true }],
                'eggs-must-have-pepper': 'error',
                'spam/must-have-eggs': 'error',
                'spam/must-have-rice': 'off',
              },
            },
          ],
          files: ['*.*'],
          rules: {
            'that/another-rule': 'warn',
            'this/the-rule': 1,
            'those/more-rules': 'error',
          },
        },
      ]
    })

    it('returns an array of configuration objects', () => {
      expect(setSeverity(config, 'warn')).toHaveLength(2)
    })

    it('modifies all objects in the array', () => {
      const actual = setSeverity(config, 'warn')

      expect(actual[0]).toMatchObject({
        rules: {
          '@eslint-plugin-plugin-eslint/no-bad-code': 'warn',
          '@foo/no-good-code': 'off',
          '@that-plugin/this-rule': expect.arrayContaining(['warn']),
          '@this-plugin/that-rule': 1,
        },
      })
      expect(actual[1]).toMatchObject({
        rules: {
          'that/another-rule': 'warn',
          'this/the-rule': 1,
          'those/more-rules': 'warn',
        },
      })
    })
  })
})
