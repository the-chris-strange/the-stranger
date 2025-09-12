---
applyTo: **/*.?(c|m)[jt]s?(x)
---

You are writing documentation for a project that uses JSDoc comments to document JavaScript and TypeScript code. Follow these guidelines to ensure consistency and clarity in the documentation.

# Generating JSDoc comments

- Use imperative mood. For example, prefer phrases like "Check for..." or "Add ... to ..." instead of "Checks for..." or "This function adds ... to ...".
- Avoid unnecessary words or phrases.
- Use sentence fragments when writing descriptions for `@param`, `@returns`, `@template`, and `@throws` tags (i.e. start with a lowercase letter and do not end with a period).
- Use the `@param` tag for function parameters. If the file is TypeScript, you can omit the type in the `@param` tag since it's already defined in the code.
- Use the `@returns` tag for functions that return a value. As with `@param`, you can omit the type in TypeScript files.
- Use the `@throws` tag when applicable to document potential exceptions. Phrase descriptions in imperative mood, e.g. "@throws {TypeError} if the input is not a string". Unless the error type is the built-in `Error`, include the error type in the tag.
- If a function's purpose or usage is not obvious, try to provide an example using the `@example` or `@examples` tags.
- Do not add a blank line between the main description and subsequent tags.
- Use `@link` inline tags to reference code from another function, class, etc.
- Use `@see` tags for links to related external documentation.
- Use the `@document` tag to reference additional documentation file(s), if applicable.
- Use the `@template` tag to document generic type parameters.

## Examples

```typescript
// GOOD EXAMPLE
/**
 * Add two numbers together.
 * @param lhs
 * @param rhs
 * @param spam some parameter whose purpose is not obvious
 * @returns the sum of the two numbers
 */
export function add(lhs: number, rhs: number, spam?: number): number {
  return lhs + rhs + (spam ?? 0)
}

// BAD EXAMPLE
/**
 * Adds two numbers together.
 * @param lhs - The first number.
 * @param {number} rhs - The second number.
 * @param spam - The spam.
 * @returns - The sum of the two numbers.
 */
export function add(lhs: number, rhs: number, spam?: number): number {
  return lhs + rhs + (spam ?? 0)
}
```

```javascript
// GOOD EXAMPLE
/**
 * Add two numbers together.
 * @param {number} lhs
 * @param {number} rhs
 * @param {number} [spam] some parameter whose purpose is not obvious
 * @returns {number} the sum of the two numbers
 */
export function add(lhs, rhs, spam) {
  return lhs + rhs + (spam ?? 0)
}

// BAD EXAMPLE
/**
 * Adds two numbers together.
 * @param {number} lhs - The first number.
 * @param rhs - The second number.
 * @param {number} spam - The spam.
 * @returns - The sum of the two numbers.
 */
export function add(lhs, rhs, spam) {
  return lhs + rhs + (spam ?? 0)
}
```
