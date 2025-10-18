import { OverwriteStrategy } from '@nx/devkit'

/**
 * Determine the overwrite strategy to use in a generator.
 * @param strategy a boolean indicating whether to overwrite existing files, or an overwrite strategy
 * @returns the overwrite strategy
 */
export function owStrategy(strategy?: boolean | OverwriteStrategy) {
  strategy ??= OverwriteStrategy.ThrowIfExisting

  if (typeof strategy === 'boolean') {
    return strategy ? OverwriteStrategy.Overwrite : OverwriteStrategy.KeepExisting
  }

  return strategy
}
