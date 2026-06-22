/**
 * Create a {@link RuleMatcher} from an array of strings. If an array is not provided, or the provided array has no members, the matcher will always return true; otherwise, the matcher will return true for any rule matching these criteria:
 * - the rule name is included in the array
 * - the rule is part of a plugin, and the plugin name is included in the array
 * @param rules the array of strings to match rules against
 * @returns a {@link RuleMatcher} function
 */
export function ruleMatcher(rules?: string[]): RuleMatcher {
  if (rules === undefined || rules.length === 0) {
    return () => true
  }

  return key =>
    rules.some(e => {
      if (e === key) {
        return true
      }

      if (key.includes('/')) {
        const [ns] = key.split('/', 2)
        return e === ns || (ns.startsWith('@') && e === ns.slice(1))
      } else {
        return false
      }
    })
}

export type RuleMatcher = (key: string) => boolean
