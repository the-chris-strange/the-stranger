import {
  type PathSyntaxErrorCode,
  type RelatedSourceSpan,
  PropertyPathSyntaxError,
} from './property-path-syntax-error'

export class PathParser {
  private index = 0
  private readonly options: ParsePathOptions
  private readonly source: string

  constructor(source: string, options?: Partial<ParsePathOptions>) {
    this.source = source

    const { allowLoneSurrogates = true, maximumIndex = Number.MAX_SAFE_INTEGER } =
      options ?? {}

    if (!Number.isSafeInteger(maximumIndex) || maximumIndex < 0) {
      throw new RangeError('maximumIndex must be a non-negative safe integer')
    }

    this.options = { allowLoneSurrogates, maximumIndex }
  }

  parse(): ParsedPath {
    this.skipWhitespace()
    const expressionStart = this.index

    if (this.isAtEnd()) {
      return this.createParsedPath({
        expressionEnd: expressionStart,
        expressionStart,
        segments: [],
      })
    }

    let root: RootNode | undefined
    const segments: PathSegment[] = []

    if (this.current() === '$') {
      root = this.parseRoot()
    } else {
      segments.push(this.parseInitialSegment())
    }

    const expressionEnd = this.parseContinuations(segments, root !== undefined)

    return this.createParsedPath({
      expressionEnd,
      expressionStart,
      root,
      segments,
    })
  }

  private closeBracket(openingBracket: number) {
    if (this.current() === ']') {
      this.index += 1
      return
    }

    if (this.isAtEnd()) {
      this.fail(
        'expected-closing-bracket',
        'Expected a closing bracket',
        createSpan(this.source.length, this.source.length),
        [
          {
            message: 'Bracket opened here',
            span: createSpan(openingBracket, openingBracket + 1),
          },
        ],
      )
    }

    this.fail(
      'expected-closing-bracket',
      'Expected a closing bracket',
      this.currentSpan(),
      [
        {
          message: 'Bracket opened here',
          span: createSpan(openingBracket, openingBracket + 1),
        },
      ],
    )
  }

  private createEscapeNode(
    escapeStart: number,
    kind: EscapeSequenceKind,
    value: string,
    codePoint?: number,
  ): EscapeSequenceNode {
    return {
      codePoint,
      kind,
      raw: this.source.slice(escapeStart, this.index),
      span: createSpan(escapeStart, this.index),
      type: 'escape-sequence',
      value,
    }
  }

  private createParsedPath({
    expressionEnd,
    expressionStart,
    root,
    segments,
  }: {
    expressionEnd: number
    expressionStart: number
    root?: RootNode
    segments: readonly PathSegment[]
  }): ParsedPath {
    return {
      expressionSpan: createSpan(expressionStart, expressionEnd),
      root,
      segments,
      source: this.source,
      span: createSpan(0, this.source.length),
      type: 'path',
    }
  }

  private current() {
    return this.source[this.index]
  }

  private currentCharacter() {
    const codePoint = this.source.codePointAt(this.index)
    return codePoint === undefined ? '' : String.fromCodePoint(codePoint)
  }

  private currentSpan(): SourceSpan {
    return createSpan(this.index, this.index + this.currentCharacter().length)
  }

  private fail(
    code: PathSyntaxErrorCode,
    message: string,
    issueSpan: SourceSpan,
    related?: readonly RelatedSourceSpan[],
  ): never {
    throw new PropertyPathSyntaxError(this.source, {
      code,
      message,
      related,
      span: issueSpan,
    })
  }

  private isAtEnd() {
    return this.index >= this.source.length
  }

  private parseBareProperty(
    notation: Extract<PropertyNotation, 'bare' | 'bracket-bare' | 'dot-bare'>,
    segmentStart = this.index,
  ): PropertySegment {
    const valueStart = this.index
    this.index += this.currentCharacter().length

    while (!this.isAtEnd() && isIdentifierContinue(this.currentCharacter())) {
      this.index += this.currentCharacter().length
    }

    return {
      key: this.source.slice(valueStart, this.index),
      notation,
      span: createSpan(segmentStart, this.index),
      type: 'property',
      valueSpan: createSpan(valueStart, this.index),
    }
  }

  private parseBracketSegment(): PathSegment {
    const segmentStart = this.index
    this.index += 1
    this.skipWhitespace()

    if (this.isAtEnd()) {
      this.fail(
        'expected-property',
        'Expected a property or index inside brackets',
        createSpan(this.index, this.index),
        [
          {
            message: 'Bracket opened here',
            span: createSpan(segmentStart, segmentStart + 1),
          },
        ],
      )
    }

    const next = this.current()

    if (next === '"' || next === "'") {
      const string = this.parseStringLiteral()
      this.skipWhitespace()
      this.closeBracket(segmentStart)

      return {
        key: string.value,
        notation: 'bracket-quoted',
        span: createSpan(segmentStart, this.index),
        string,
        type: 'property',
        valueSpan: string.span,
      }
    }

    if (next === '-' || isDecimalDigit(next)) {
      const segment = this.parseIndexSegment(segmentStart)
      this.skipWhitespace()
      this.closeBracket(segmentStart)

      return {
        ...segment,
        span: createSpan(segmentStart, this.index),
      }
    }

    if (isIdentifierStart(this.currentCharacter())) {
      const segment = this.parseBareProperty('bracket-bare', segmentStart)
      this.skipWhitespace()
      this.closeBracket(segmentStart)

      return {
        ...segment,
        span: createSpan(segmentStart, this.index),
      }
    }

    this.fail(
      'expected-property',
      'Expected a property or index inside brackets',
      this.currentSpan(),
    )
  }

  private parseContinuations(segments: PathSegment[], followsRoot: boolean): number {
    let expressionEnd = this.index

    while (true) {
      this.skipWhitespace()

      if (this.isAtEnd()) {
        return expressionEnd
      }

      if (this.current() === '[') {
        segments.push(this.parseBracketSegment())
        expressionEnd = this.index
        followsRoot = false
        continue
      }

      if (this.current() === '.') {
        segments.push(this.parseDotContinuation())
        expressionEnd = this.index
        followsRoot = false
        continue
      }

      this.fail(
        followsRoot ? 'invalid-root-continuation' : 'unexpected-character',
        followsRoot
          ? 'A root marker must be followed by a dot or bracket segment'
          : `Unexpected character ${JSON.stringify(this.currentCharacter())}`,
        this.currentSpan(),
      )
    }
  }

  private parseDotContinuation(): PropertySegment {
    const segmentStart = this.index
    this.index += 1
    this.skipWhitespace()

    if (this.isAtEnd()) {
      this.fail(
        'unexpected-end',
        'Expected a property after the dot',
        createSpan(this.index, this.index),
      )
    }

    if (this.current() === '[') {
      this.fail(
        'expected-property',
        'A bracket segment cannot follow a dot',
        this.currentSpan(),
      )
    }

    if (this.current() === '"' || this.current() === "'") {
      return this.parseQuotedProperty('dot-quoted', segmentStart)
    }

    if (isIdentifierStart(this.currentCharacter())) {
      return this.parseBareProperty('dot-bare', segmentStart)
    }

    this.fail(
      'expected-property',
      'Expected a property after the dot',
      this.currentSpan(),
    )
  }

  private parseEscapeSequence(): EscapeSequenceNode {
    const escapeStart = this.index
    this.index += 1

    if (this.isAtEnd()) {
      this.fail(
        'invalid-escape',
        'Expected an escape sequence after the backslash',
        createSpan(escapeStart, this.index),
      )
    }

    const escaped = this.current()
    this.index += 1

    const simpleEscape = getSimpleEscape(escaped)
    if (simpleEscape !== undefined) {
      return this.createEscapeNode(escapeStart, simpleEscape.kind, simpleEscape.value)
    }

    if (escaped === '0') {
      if (isDecimalDigit(this.current())) {
        this.fail(
          'invalid-escape',
          'Legacy octal escape sequences are not allowed',
          createSpan(escapeStart, this.index + 1),
        )
      }

      return this.createEscapeNode(escapeStart, 'null', '\0')
    }

    if (escaped === 'x') {
      return this.parseFixedHexadecimalEscape(
        escapeStart,
        2,
        'hexadecimal',
        'invalid-hexadecimal-escape',
      )
    }

    if (escaped === 'u') {
      return this.current() === '{'
        ? this.parseUnicodeCodePointEscape(escapeStart)
        : this.parseFixedHexadecimalEscape(
            escapeStart,
            4,
            'unicode',
            'invalid-unicode-escape',
          )
    }

    this.fail(
      'invalid-escape',
      `Unknown escape sequence \\${escaped}`,
      createSpan(escapeStart, this.index),
    )
  }

  private parseFixedHexadecimalEscape(
    escapeStart: number,
    length: number,
    kind: Extract<EscapeSequenceKind, 'hexadecimal' | 'unicode'>,
    errorCode: Extract<
      PathSyntaxErrorCode,
      'invalid-hexadecimal-escape' | 'invalid-unicode-escape'
    >,
  ): EscapeSequenceNode {
    const digitsStart = this.index
    const digitsEnd = digitsStart + length
    const digits = this.source.slice(digitsStart, digitsEnd)

    if (digits.length !== length || !isHexadecimal(digits)) {
      this.fail(
        errorCode,
        `Expected exactly ${length} hexadecimal digits`,
        createSpan(escapeStart, Math.min(digitsEnd, this.source.length)),
      )
    }

    this.index = digitsEnd
    const codePoint = Number.parseInt(digits, 16)

    return this.createEscapeNode(
      escapeStart,
      kind,
      String.fromCodePoint(codePoint),
      codePoint,
    )
  }

  private parseIndexSegment(segmentStart: number): IndexSegment {
    const valueStart = this.index

    if (this.current() === '-') {
      this.index += 1

      if (!isDecimalDigit(this.current())) {
        this.fail(
          'invalid-integer',
          'Expected a decimal digit after the minus sign',
          createSpan(valueStart, this.index),
        )
      }
    }

    const digitsStart = this.index
    while (isDecimalDigit(this.current())) {
      this.index += 1
    }

    const digits = this.source.slice(digitsStart, this.index)
    const raw = this.source.slice(valueStart, this.index)

    if (digits.length > 1 && digits.startsWith('0')) {
      this.fail(
        'leading-zero',
        'Leading zeros are not allowed in indexes',
        createSpan(valueStart, this.index),
      )
    }

    if (raw === '-0') {
      this.fail(
        'negative-zero',
        'Negative zero is not a valid index',
        createSpan(valueStart, this.index),
      )
    }

    if (!this.isAtEnd() && isIdentifierContinue(this.currentCharacter())) {
      this.fail(
        'invalid-integer',
        'Unexpected character after the integer',
        this.currentSpan(),
      )
    }

    const index = Number(raw)
    if (!Number.isSafeInteger(index) || Math.abs(index) > this.options.maximumIndex) {
      this.fail(
        'integer-out-of-range',
        `Index must be between -${this.options.maximumIndex} and ${this.options.maximumIndex}`,
        createSpan(valueStart, this.index),
      )
    }

    return {
      index,
      notation: 'bracket-index',
      raw,
      span: createSpan(segmentStart, this.index),
      type: 'index',
      valueSpan: createSpan(valueStart, this.index),
    }
  }

  private parseInitialSegment(): PathSegment {
    if (this.current() === '[') {
      return this.parseBracketSegment()
    }

    if (this.current() === '"' || this.current() === "'") {
      return this.parseQuotedProperty('quoted')
    }

    if (isIdentifierStart(this.currentCharacter())) {
      return this.parseBareProperty('bare')
    }

    this.fail(
      'expected-property',
      'Expected a property or bracket segment',
      this.currentSpan(),
    )
  }

  private parseQuotedProperty(
    notation: Extract<PropertyNotation, 'dot-quoted' | 'quoted'>,
    segmentStart = this.index,
  ): PropertySegment {
    const string = this.parseStringLiteral()

    return {
      key: string.value,
      notation,
      span: createSpan(segmentStart, this.index),
      string,
      type: 'property',
      valueSpan: string.span,
    }
  }

  private parseRoot(): RootNode {
    const start = this.index
    this.index += 1

    return {
      span: createSpan(start, this.index),
      type: 'root',
    }
  }

  private parseStringLiteral(): StringLiteralNode {
    const quote = this.current() as StringQuote
    const literalStart = this.index
    const contentStart = literalStart + 1
    const escapes: EscapeSequenceNode[] = []
    let value = ''

    this.index += 1

    while (!this.isAtEnd()) {
      const character = this.currentCharacter()

      if (character === quote) {
        const contentEnd = this.index
        this.index += 1
        this.validateEscapedSurrogates(escapes)

        return {
          contentSpan: createSpan(contentStart, contentEnd),
          escapes,
          quote,
          span: createSpan(literalStart, this.index),
          type: 'string-literal',
          value,
        }
      }

      if (character === '\\') {
        const escape = this.parseEscapeSequence()
        escapes.push(escape)
        value += escape.value
        continue
      }

      if (isLineTerminator(character)) {
        this.fail(
          'unescaped-line-terminator',
          'Line terminators must be escaped inside quoted properties',
          this.currentSpan(),
        )
      }

      value += character
      this.index += character.length
    }

    this.fail(
      'expected-closing-quote',
      `Expected a closing ${quote}`,
      createSpan(this.source.length, this.source.length),
      [
        {
          message: 'String literal opened here',
          span: createSpan(literalStart, literalStart + 1),
        },
      ],
    )
  }

  private parseUnicodeCodePointEscape(escapeStart: number): EscapeSequenceNode {
    this.index += 1
    const digitsStart = this.index

    while (isHexadecimalDigit(this.current())) {
      this.index += 1
    }

    const digits = this.source.slice(digitsStart, this.index)

    if (digits.length === 0 || digits.length > 6) {
      this.fail(
        'invalid-unicode-code-point',
        'A Unicode code point escape requires 1 to 6 hexadecimal digits',
        createSpan(escapeStart, this.index),
      )
    }

    if (this.current() !== '}') {
      this.fail(
        'invalid-unicode-code-point',
        'Expected a closing brace in the Unicode code point escape',
        this.isAtEnd() ? createSpan(this.index, this.index) : this.currentSpan(),
      )
    }

    this.index += 1
    const codePoint = Number.parseInt(digits, 16)

    if (codePoint > 1114111 || (codePoint >= 55296 && codePoint <= 57343)) {
      this.fail(
        'invalid-unicode-code-point',
        'Unicode code point escape must contain a Unicode scalar value',
        createSpan(escapeStart, this.index),
      )
    }

    return this.createEscapeNode(
      escapeStart,
      'unicode-code-point',
      String.fromCodePoint(codePoint),
      codePoint,
    )
  }

  private skipWhitespace() {
    while (isWhitespace(this.current())) {
      this.index += 1
    }
  }

  private validateEscapedSurrogates(escapes: readonly EscapeSequenceNode[]) {
    if (this.options.allowLoneSurrogates) {
      return
    }

    for (const [index, escape] of escapes.entries()) {
      if (escape.kind !== 'unicode' || escape.codePoint === undefined) {
        continue
      }

      if (isHighSurrogate(escape.codePoint)) {
        const next = escapes[index + 1]
        if (
          next?.span.start === escape.span.end &&
          next.kind === 'unicode' &&
          next.codePoint !== undefined &&
          isLowSurrogate(next.codePoint)
        ) {
          continue
        }

        this.fail(
          'invalid-unicode-escape',
          'Escaped high surrogate must be followed by an escaped low surrogate',
          escape.span,
        )
      }

      if (isLowSurrogate(escape.codePoint)) {
        const previous = escapes[index - 1]
        if (
          previous?.span.end === escape.span.start &&
          previous.kind === 'unicode' &&
          previous.codePoint !== undefined &&
          isHighSurrogate(previous.codePoint)
        ) {
          continue
        }

        this.fail(
          'invalid-unicode-escape',
          'Escaped low surrogate must follow an escaped high surrogate',
          escape.span,
        )
      }
    }
  }
}

export interface IndexSegment {
  readonly index: number
  readonly notation: 'bracket-index'
  readonly raw: string
  readonly span: SourceSpan
  readonly type: 'index'
  readonly valueSpan: SourceSpan
}

export interface ParsedPath {
  readonly expressionSpan: SourceSpan
  readonly segments: readonly PathSegment[]
  readonly source: string
  readonly span: SourceSpan
  readonly type: 'path'
  readonly root?: RootNode
}

export interface ParsePathOptions {
  readonly allowLoneSurrogates: boolean
  readonly maximumIndex: number
}

export type PathSegment = IndexSegment | PropertySegment

export interface PropertySegment {
  readonly key: string
  readonly notation: PropertyNotation
  readonly span: SourceSpan
  readonly type: 'property'
  readonly valueSpan: SourceSpan
  readonly string?: StringLiteralNode
}

export interface SourceSpan {
  readonly end: number
  readonly start: number
}

function createSpan(start: number, end: number): SourceSpan {
  return { end, start }
}

function getSimpleEscape(character: string): SimpleEscape | undefined {
  switch (character) {
    case '"':
      return { kind: 'double-quote', value: '"' }
    case "'":
      return { kind: 'single-quote', value: "'" }
    case '\\':
      return { kind: 'backslash', value: '\\' }
    case 'b':
      return { kind: 'backspace', value: '\b' }
    case 'f':
      return { kind: 'form-feed', value: '\f' }
    case 'n':
      return { kind: 'line-feed', value: '\n' }
    case 'r':
      return { kind: 'carriage-return', value: '\r' }
    case 't':
      return { kind: 'horizontal-tab', value: '\t' }
    case 'v':
      return { kind: 'vertical-tab', value: '\v' }
    default:
      return
  }
}

function isDecimalDigit(character: string | undefined) {
  return character !== undefined && character >= '0' && character <= '9'
}

function isHexadecimal(value: string) {
  return Array.from(value).every(isHexadecimalDigit)
}

function isHexadecimalDigit(character: string | undefined) {
  return (
    character !== undefined &&
    ((character >= '0' && character <= '9') ||
      (character >= 'A' && character <= 'F') ||
      (character >= 'a' && character <= 'f'))
  )
}

function isHighSurrogate(codePoint: number) {
  return codePoint >= 55296 && codePoint <= 56319
}

function isIdentifierContinue(character: string) {
  return /^[\p{ID_Continue}-]$/u.test(character)
}

function isIdentifierStart(character: string) {
  return /^[\p{ID_Start}_]$/u.test(character)
}

function isLineTerminator(character: string) {
  return (
    character === '\n' ||
    character === '\r' ||
    character === '\u2028' ||
    character === '\u2029'
  )
}

function isLowSurrogate(codePoint: number) {
  return codePoint >= 56320 && codePoint <= 57343
}

function isWhitespace(character: string | undefined) {
  return (
    character === ' ' || character === '\t' || character === '\n' || character === '\r'
  )
}

type EscapeSequenceKind =
  | 'backslash'
  | 'backspace'
  | 'carriage-return'
  | 'double-quote'
  | 'form-feed'
  | 'hexadecimal'
  | 'horizontal-tab'
  | 'line-feed'
  | 'null'
  | 'single-quote'
  | 'unicode-code-point'
  | 'unicode'
  | 'vertical-tab'

interface EscapeSequenceNode {
  readonly kind: EscapeSequenceKind
  readonly raw: string
  readonly span: SourceSpan
  readonly type: 'escape-sequence'
  readonly value: string
  readonly codePoint?: number
}

type PropertyNotation =
  'bare' | 'bracket-bare' | 'bracket-quoted' | 'dot-bare' | 'dot-quoted' | 'quoted'

interface RootNode {
  readonly span: SourceSpan
  readonly type: 'root'
}

type SimpleEscape = Pick<EscapeSequenceNode, 'kind' | 'value'>

interface StringLiteralNode {
  readonly contentSpan: SourceSpan
  readonly escapes: readonly EscapeSequenceNode[]
  readonly quote: StringQuote
  readonly span: SourceSpan
  readonly type: 'string-literal'
  readonly value: string
}

type StringQuote = '"' | "'"
