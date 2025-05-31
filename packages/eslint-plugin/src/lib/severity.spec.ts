import { describe, expect, it } from 'vitest'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import {
  isSeverity,
  isSeverityNumber,
  isSeverityString,
  setConfigSeverity,
  setRuleSeverity,
  setSeverity,
  toSeverity,
} from './severity'

const severityNumberTestCases: [boolean, any][] = [
  [true, 0],
  [true, 1],
  [true, 2],
  [false, -1],
  [false, 3],
  [false, Number.NaN],
  [false, '0'],
]

const severityStringTestCases: [boolean, any][] = [
  [true, 'off'],
  [true, 'warn'],
  [true, 'error'],
  [false, 'foo'],
  [false, 'OFF'],
  [false, ''],
  [false, undefined],
  [false, null],
]

describe('isSeverity', () => {
  it.each([...severityNumberTestCases, ...severityStringTestCases])(
    'returns %s for %s',
    (expected, value) => {
      expect(isSeverity(value)).toBe(expected)
    },
  )
})

describe('isSeverityNumber', () => {
  it.each(severityNumberTestCases)('returns %s for %s', (expected, value) => {
    expect(isSeverityNumber(value)).toBe(expected)
  })
})

describe('isSeverityString', () => {
  it.each(severityStringTestCases)('returns %s for %s', (expected, value) => {
    expect(isSeverityString(value)).toBe(expected)
  })
})

describe('setConfigSeverity', () => {
  it('sets severity for all rules in config', () => {
    const config: FlatConfig.Config = {
      rules: {
        bar: ['warn', { opt: true }],
        baz: undefined,
        foo: 1,
      },
    }
    const result = setConfigSeverity('error', config)
    expect(result.rules?.['foo']).toBe('error')
    expect(Array.isArray(result.rules?.['bar'])).toBe(true)
    expect((result.rules?.['bar'] as any[])[0]).toBe('error')
    expect(result.rules?.['baz']).toBeUndefined()
  })

  it('returns config unchanged if no rules', () => {
    const config: FlatConfig.Config = {}
    expect(setConfigSeverity('warn', config)).toEqual(config)
  })
})

describe('setRuleSeverity', () => {
  it('replaces severity if rule is a severity', () => {
    expect(setRuleSeverity('warn', 2)).toBe('warn')
    expect(setRuleSeverity('off', 'error')).toBe('off')
  })

  it('sets severity in rule array', () => {
    const rule: FlatConfig.RuleEntry = ['warn', { foo: true }]
    const result = setRuleSeverity('error', rule)
    expect(Array.isArray(result)).toBe(true)
    expect((result as any[])[0]).toBe('error')
    expect((result as any[])[1]).toEqual({ foo: true })
  })

  it('returns rule unchanged for non-severity, non-array', () => {
    const rule: any = { foo: true }
    expect(setRuleSeverity('warn', rule)).toBe(rule)
  })
})

describe('setSeverity', () => {
  it('sets severity for a single config', async () => {
    const config: FlatConfig.Config = {
      rules: { bar: ['warn', {}], foo: 1 },
    }
    const result = await setSeverity('off', config)
    expect(result[0].rules?.['foo']).toBe('off')
    expect((result[0].rules?.['bar'] as any[])[0]).toBe('off')
  })

  it('sets severity for multiple configs', async () => {
    const configs: FlatConfig.Config[] = [
      { rules: { foo: 1 } },
      { rules: { bar: ['warn', {}] } },
    ]
    const result = await setSeverity('warn', ...configs)
    expect(result[0].rules?.['foo']).toBe('warn')
    expect((result[1].rules?.['bar'] as any[])[0]).toBe('warn')
  })
})

describe('toSeverity', () => {
  const testCases = [...severityNumberTestCases, ...severityStringTestCases].map(
    ([expected, value]) => {
      if (expected) {
        if (value === 1 || value === 'warn') {
          return ['warn', value]
        }
        if (value === 2 || value === 'error') {
          return ['error', value]
        }
      }
      return ['off', value]
    },
  )

  it.each(testCases)('returns %s for %s', (expected, value) => {
    expect(toSeverity(value)).toBe(expected)
  })
})
