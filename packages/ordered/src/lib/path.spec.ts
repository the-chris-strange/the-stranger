import { describe, expect, it } from 'vitest'

import { matchesPattern, pathToString } from './path.js'

describe('path patterns', () => {
  it('matches regular expressions without retaining state', () => {
    const pattern = /eslint\.probe/g
    expect(matchesPattern(pattern, ['eslint.probe'])).toBe(true)
    expect(matchesPattern(pattern, ['eslint.probe'])).toBe(true)
    expect(matchesPattern(pattern, ['other'])).toBe(false)
  })

  it('quotes non-identifier keys for regular-expression paths', () => {
    expect(
      matchesPattern(/^jobs\["build-test"\]\.steps$/, ['jobs', 'build-test', 'steps']),
    ).toBe(true)
    expect(matchesPattern(/^jobs\..+steps/, ['jobs', 'build-test', 'steps'])).toBe(
      false,
    )
    expect(pathToString(['jobs', 'build-test', 'steps'])).toBe('jobs.build-test.steps')
  })

  it('formats object and array path segments', () => {
    expect(pathToString(['users', 0, 'name'])).toBe('users[0].name')
    expect(pathToString([])).toBe('')
  })

  it.each([
    ['', [], true],
    ['scripts', ['scripts'], true],
    ['users[*]', ['users', 3], true],
    ['users[*]', ['users', 3, 'name'], false],
    ['dependencies.*', ['dependencies', 'a'], true],
    ['**', [], true],
    ['**.name', ['name'], true],
    ['**.name', ['users', 0, 'name'], true],
    ['app.**.name', ['app', 'name'], true],
    ['app.**', ['app'], true],
    ['app.**.name', ['other', 'name'], false],
  ] as const)('matches %s against %j as %s', (pattern, path, expected) => {
    expect(matchesPattern(pattern, [...path])).toBe(expected)
  })
})
