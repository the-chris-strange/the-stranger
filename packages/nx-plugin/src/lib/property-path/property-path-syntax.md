# Formal Syntax for the Property Path package

```ebnf
path = whitespace, [ expression ], whitespace;

expression = rooted-path | relative-path;

rooted-path = "$", { continuation };

relative-path = initial-segment, { continuation };

initial-segment = initial-property | bracket-segment;

initial-property = bare-property | quoted-property;

continuation = whitespace, ( dot-continuation | bracket-continuation );

dot-continuation = ".", whitespace, dot-property;

dot-property = bare-property | quoted-property;

bracket-continuation = bracket-segment;

bracket-segment = "[", whitespace, bracket-value, whitespace, "]";

bracket-value = integer | bare-property | quoted-property;

bare-property = identifier-start, { identifier-continue };

identifier-start = Unicode-ID-Start | "_";

identifier-continue = Unicode-ID-Continue | "-";

quoted-property = double-quoted-string | single-quoted-string;

double-quoted-string = '"', { double-string-character | escape-sequence }, '"';

single-quoted-string = "'", { single-string-character | escape-sequence }, "'";

double-string-character = ? any source character except '"', "\", U+000A, U+000D, U+2028, or U+2029 ?;

single-string-character = ? any source character except "'", "\", U+000A, U+000D, U+2028, or U+2029 ?;

escape-sequence = "\", ( simple-escape | null-escape | hexadecimal-escape | unicode-escape | unicode-code-point-escape );

simple-escape = "'" | '"' | "\" | "b" | "f" | "n" | "r" | "t" | "v";

null-escape = "0";

hexadecimal-escape = "x", hexadecimal-digit, hexadecimal-digit;

unicode-escape = "u", hexadecimal-digit, hexadecimal-digit, hexadecimal-digit, hexadecimal-digit;

unicode-code-point-escape = "u", "{", hexadecimal-digit, [ hexadecimal-digit, [ hexadecimal-digit, [ hexadecimal-digit, [ hexadecimal-digit, [ hexadecimal-digit ] ] ] ] ], "}";

integer = "0" | [ "-" ], nonzero-digit, { decimal-digit };

decimal-digit = "0" | nonzero-digit;

nonzero-digit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

hexadecimal-digit = decimal-digit | "A" | "B" | "C" | "D" | "E" | "F" | "a" | "b" | "c" | "d" | "e" | "f";

whitespace = { whitespace-character };

whitespace-character = U+0009 | U+000A | U+000D | U+0020;
```

Semantic constraints:

- `Unicode-ID-Start` and `Unicode-ID-Continue` are the Unicode `ID_Start` and `ID_Continue` properties, respectively.
- An index must be a safe integer whose absolute value does not exceed `maximumIndex`; `maximumIndex` defaults to `Number.MAX_SAFE_INTEGER` and must itself be a non-negative safe integer.
- A null escape (`\0`) must not be followed by a decimal digit.
- A Unicode code-point escape must encode a Unicode scalar value from U+0000 through U+10FFFF, excluding U+D800 through U+DFFF.
- Four-digit Unicode escapes (`\uHHHH`) may encode UTF-16 surrogate code units. When `allowLoneSurrogates` is `false`, escaped surrogates must occur as adjacent high-surrogate/low-surrogate escape pairs; its default value is `true`.
