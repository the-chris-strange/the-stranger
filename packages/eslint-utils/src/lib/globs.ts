import { combineExtensions } from './extensions.js'

/**
 * Create a glob pattern that recursively matches files with the specified extensions.
 * @internal
 * @param extensions file extensions to match
 * @returns a glob pattern that matches any of the file extensions
 */
export function createRecursivePattern(...extensions: (string | string[])[]) {
  return applyPrefix('**/*.', combineExtensions(...extensions))
}

/**
 * Create a glob pattern that recursively matches test files with the specified extensions.
 * @internal
 * @param extensions file extensions to match
 * @returns a glob pattern that matches test files with any of the file extensions
 */
export function createRecursiveTestPattern(...extensions: (string | string[])[]) {
  return applyPrefix('**/*.{spec,test}.', combineExtensions(...extensions))
}

/**
 * Apply a prefix to a value if it doesn't already have it.
 * @param prefix the prefix to apply
 * @param value the value to which to apply the prefix
 * @returns the combined prefix and pattern
 */
function applyPrefix(prefix: string, value: string) {
  return value.startsWith(prefix) ? value : `${prefix}${value}`
}
