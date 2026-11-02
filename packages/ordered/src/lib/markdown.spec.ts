import { describe, expect, it } from 'vitest'

import { sortFrontmatter } from './markdown.js'

describe('Markdown frontmatter', () => {
  it('sorts frontmatter while preserving the body byte for byte', () => {
    const body = '\n# Body\n\n```yaml\nb: 1\na: 2\n```\n'
    const output = sortFrontmatter('---\nb: 1\na: 2\n---' + body)
    expect(output).toBe('---\na: 2\nb: 1\n---' + body)
  })

  it('preserves CRLF body content and forwards sorting options', () => {
    const body = '\r\n\r\n# Body\r\n'
    const output = sortFrontmatter('---\r\na: 1\r\nb: 2\r\n---' + body, {
      objectKeys: { order: 'desc' },
    })
    expect(output.endsWith('---' + body)).toBe(true)
    expect(output.indexOf('b: 2')).toBeLessThan(output.indexOf('a: 1'))
  })

  it.each([
    '# Heading\n',
    '--- not a fence\na: 1\n',
    '---\na: 1\n',
    '---\na: 1\na: 2\n---\nbody\n',
  ])('returns unchanged input for absent or invalid frontmatter %j', input => {
    expect(sortFrontmatter(input)).toBe(input)
  })
})
