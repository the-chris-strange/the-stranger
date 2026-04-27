import { describe, expect, it } from 'vitest'

import type { Linter } from 'eslint'

import { RuleLevels } from './rule-levels.js'

type LevelThenName = [Linter.Severity, Linter.StringSeverity]
type NameThenLevel = [Linter.StringSeverity, Linter.Severity]

describe('RuleLevels', () => {
  const levelFirst: LevelThenName[] = [
    [0, 'off'],
    [1, 'warn'],
    [2, 'error'],
  ]
  const nameFirst = levelFirst.map(e => e.toReversed() as NameThenLevel)

  it.each(levelFirst)(
    'sets the expected severity (%s) given severity name of "%s"',
    (level, name) => {
      expect(new RuleLevels(name).severity).toBe(level)
    },
  )

  it.each(nameFirst)(
    'sets the expected severity name ("%s") for severity of %s',
    (name, level) => {
      expect(new RuleLevels(level).severityString).toBe(name)
    },
  )

  describe('severityOf', () => {
    it.each<[Linter.RuleEntry, Linter.Severity]>([
      [0, 0],
      [1, 1],
      [2, 2],
      ...nameFirst,
      [['off', {}], 0],
      [[1, 'things'], 1],
    ])('given %o, returns %s', (rule, expected) => {
      expect(RuleLevels.severityOf(rule)).toBe(expected)
    })
  })

  describe('switchType', () => {
    it.each<LevelThenName | NameThenLevel>([...levelFirst, ...nameFirst])(
      'given %o, returns %o',
      (severity, expected) => {
        expect(RuleLevels.switchType(severity as any)).toBe(expected)
      },
    )
  })

  describe('setLevel', () => {
    it('preserves rule options', () => {
      const levels = new RuleLevels(1)
      expect(levels.setLevel(['error', { optionA: true }])).toEqual([
        'warn',
        { optionA: true },
      ])
    })

    it('discards rule options if the new severity level is 0', () => {
      const levels = new RuleLevels(0)
      expect(levels.setLevel(['error', { option: false }])).toBe('off')
    })
  })
})
