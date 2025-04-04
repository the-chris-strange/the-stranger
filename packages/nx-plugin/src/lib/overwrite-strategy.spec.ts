import { OverwriteStrategy } from '@nx/devkit'
import { describe, expect, it } from 'vitest'

import { owStrategy } from './overwrite-strategy'

describe('owStrategy', () => {
  it('returns OverwriteStrategy.Overwrite if strategy is true', () => {
    expect(owStrategy(true)).toBe(OverwriteStrategy.Overwrite)
  })

  it('returns OverwriteStrategy.KeepExisting if strategy is false', () => {
    expect(owStrategy(false)).toBe(OverwriteStrategy.KeepExisting)
  })

  it('returns OverwriteStrategy.ThrowIfExisting if strategy is undefined', () => {
    expect(owStrategy()).toBe(OverwriteStrategy.ThrowIfExisting)
  })
})
