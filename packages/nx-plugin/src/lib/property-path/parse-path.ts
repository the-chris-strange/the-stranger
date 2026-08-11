import { type ParsedPath, type ParsePathOptions, PathParser } from './parser'
import { PropertyPathSyntaxError } from './property-path-syntax-error'

export function maybeParsePath(
  source: string,
  options?: Partial<ParsePathOptions>,
): ParsePathResult {
  try {
    return {
      path: parsePath(source, options),
      success: true,
    }
  } catch (error) {
    if (!(error instanceof PropertyPathSyntaxError)) {
      throw error
    }

    return {
      error,
      success: false,
    }
  }
}

export function parsePath(source: string, options?: Partial<ParsePathOptions>) {
  return new PathParser(source, options).parse()
}

export interface ParsePathFailure {
  readonly error: PropertyPathSyntaxError
  readonly success: false
}

export interface ParsePathSuccess {
  readonly path: ParsedPath
  readonly success: true
}

type ParsePathResult = ParsePathFailure | ParsePathSuccess
