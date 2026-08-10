import type { SourceSpan } from './parser'

/**
 * Syntax error in a property path segment.
 */
export class PropertyPathSyntaxError extends SyntaxError {
  readonly issue: PathSyntaxIssue
  readonly source: string

  constructor(source: string, issue: PathSyntaxIssue) {
    super(issue.message)
    this.source = source
    this.issue = issue
    this.name = 'PropertyPathSyntaxError'
  }

  get code() {
    return this.issue.code
  }

  get span() {
    return this.issue.span
  }
}

export type PathSyntaxErrorCode =
  | 'expected-closing-bracket'
  | 'expected-closing-quote'
  | 'expected-property'
  | 'integer-out-of-range'
  | 'invalid-escape'
  | 'invalid-hexadecimal-escape'
  | 'invalid-integer'
  | 'invalid-root-continuation'
  | 'invalid-unicode-code-point'
  | 'invalid-unicode-escape'
  | 'leading-zero'
  | 'negative-zero'
  | 'unescaped-line-terminator'
  | 'unexpected-character'
  | 'unexpected-end'

export interface PathSyntaxIssue {
  readonly code: PathSyntaxErrorCode
  readonly message: string
  readonly span: SourceSpan
  readonly related?: readonly RelatedSourceSpan[]
}

export interface RelatedSourceSpan {
  readonly message: string
  readonly span: SourceSpan
}
