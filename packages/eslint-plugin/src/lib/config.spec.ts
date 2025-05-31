import { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import { describe, expect, it } from 'vitest'

import { config, ConfigBuilder } from './config'

describe('config', () => {
  const cfg: FlatConfig.ConfigArray = [
    { rules: { foo: 'error' } },
    { rules: { bar: 'warn' } },
    { rules: { baz: 'off' } },
    { rules: { qux: ['error', { someOption: true }] } },
  ]

  it('accepts a single config object', async () => {
    await expect(config(cfg[0])).resolves.toEqual([cfg[0]])
  })

  it('accepts an array of config objects', async () => {
    await expect(config(...cfg)).resolves.toEqual(cfg)
  })

  it('accepts multiple config builders', async () => {
    const builder1: ConfigBuilder = async () => cfg[0]
    const builder2: ConfigBuilder = async () => cfg[1]
    const builder3: ConfigBuilder = async () => undefined
    await expect(config(builder1, builder2, builder3)).resolves.toEqual([
      cfg[0],
      cfg[1],
    ])
  })

  it('accepts synchronous config builders', async () => {
    const builder: ConfigBuilder = () => cfg[2]
    await expect(config(builder)).resolves.toEqual([cfg[2]])
  })

  it('flattens nested arrays of config objects', async () => {
    await expect(config([cfg[0], [cfg[1], [cfg[2]]]])).resolves.toEqual(cfg.slice(0, 3))
  })

  it('flattens the results from config builder functions', async () => {
    const builder: ConfigBuilder = async () => cfg[1]
    await expect(config(builder)).resolves.toEqual([cfg[1]])
  })

  it('handles mixed inputs of config objects, arrays, and builders', async () => {
    const builder: ConfigBuilder = async () => cfg[3]
    await expect(config(cfg[0], builder, [cfg[1], cfg[2]])).resolves.toEqual([
      cfg[0],
      cfg[3],
      cfg[1],
      cfg[2],
    ])
  })

  it('does not return undefined values', async () => {
    const builder: ConfigBuilder = async () => undefined
    await expect(config(cfg[0], builder, cfg[1], undefined)).resolves.toEqual([
      cfg[0],
      cfg[1],
    ])
  })

  it('handles an empty array', async () => {
    await expect(config([])).resolves.toEqual([])
  })

  it('handles weird nesting like a true boss', async () => {
    const nestedBuilder: ConfigBuilder = async () => [
      cfg[0],
      async () => cfg[1],
      [cfg[2], async () => [[cfg[3]]]],
    ]
    await expect(config(nestedBuilder)).resolves.toEqual(cfg)
  })
})
