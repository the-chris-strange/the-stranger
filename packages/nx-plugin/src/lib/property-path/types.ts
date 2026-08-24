import type { ParsedPath } from './parser'

/**
 * A property path expressed as source text, a parsed path, or path segments.
 */
export type PropertyPath = string | Iterable<PropertyPathSegment> | ParsedPath

/**
 * A property key or array index in a property path.
 */
export type PropertyPathSegment = PropertyKey
