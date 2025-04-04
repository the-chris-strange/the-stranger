/**
 * Ensure that a string ends with a period.
 * @param value the string to add a period to
 * @returns the value with a period at the end
 */
export function addPeriod(value: string): string {
  return value.endsWith('.') ? value : `${value}.`
}
