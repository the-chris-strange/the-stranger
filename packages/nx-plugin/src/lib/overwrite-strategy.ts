import { OverwriteStrategy } from '@nx/devkit'

/**
 * Determine the overwrite strategy to use in a generator.
 * @param strategy a boolean indicating whether to overwrite existing files
 * @returns the overwrite strategy
 */
export function owStrategy(strategy?: boolean) {
  if (strategy === undefined) {
    return OverwriteStrategy.ThrowIfExisting
  }

  return strategy ? OverwriteStrategy.Overwrite : OverwriteStrategy.KeepExisting
}
