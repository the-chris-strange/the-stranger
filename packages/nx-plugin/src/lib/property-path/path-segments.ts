import type { ParsedPath, PathSegment } from './parser'
import type { PropertyPath, PropertyPathSegment } from './types'

import { parsePath } from './parse-path'

/**
 * Convert any supported property path into traversal keys.
 * @internal
 * @param path property path to convert.
 * @yields each traversal key in the path.
 */
export function* getPathSegments(
  path: PropertyPath,
): Generator<PropertyPathSegment, void> {
  if (typeof path === 'string') {
    yield* getParsedPathSegments(parsePath(path))
    return
  }

  if (isParsedPath(path)) {
    yield* getParsedPathSegments(path)
    return
  }

  yield* path
}

function* getParsedPathSegments(
  path: ParsedPath,
): Generator<PropertyPathSegment, void> {
  for (const segment of path.segments) {
    yield getSegmentKey(segment)
  }
}

function getSegmentKey(segment: PathSegment): PropertyPathSegment {
  return segment.type === 'index' ? segment.index : segment.key
}

function isParsedPath(
  path: Iterable<PropertyPathSegment> | ParsedPath,
): path is ParsedPath {
  return (
    typeof path === 'object' && path !== null && 'type' in path && path.type === 'path'
  )
}
