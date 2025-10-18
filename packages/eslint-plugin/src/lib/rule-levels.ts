import type { Linter } from 'eslint'

export class RuleLevels {
  /**
   * The numeric rule level - 0, 1, or 2.
   */
  readonly severity: Linter.Severity
  /**
   * The text rule level - 'off', 'warn', or 'error'.
   */
  readonly severityString: Linter.StringSeverity

  constructor(severity: Linter.RuleSeverity) {
    if (typeof severity === 'number') {
      this.severity = severity
      this.severityString = RuleLevels.switchType(severity)
    } else {
      this.severityString = severity
      this.severity = RuleLevels.switchType(severity)
    }
  }

  /**
   * Get the severity of this instance with the same type as another severity level.
   * @param level the original severity
   * @returns the severity of this instance
   * @example
   * ```typescript
   * const levels = new RuleLevels('off')
   * const levelString = levels.matchType('error') // 'off'
   * const levelNumber = levels.matchType(1) // 0
   * ```
   */
  matchType(level: Linter.RuleSeverity) {
    if (typeof level === 'string') {
      return this.severityString
    }
    return this.severity
  }

  /**
   * Set the rule level/severity of a configuration rule, preserving the type of the original value, as well as any options specified in the rule.
   * @param entry a rule entry
   * @returns the rule entry with the updated severity
   */
  setLevel(entry: Linter.RuleEntry): Linter.RuleEntry {
    if (Array.isArray(entry)) {
      const [lvl, ...options] = entry
      return [this.matchType(lvl), ...options]
    }
    return this.matchType(entry)
  }

  /**
   * Convert a numeric rule level (0, 1, or 2) to its string equivalent.
   * @param severity the numeric rule level
   * @returns the string equivalent of the rule level
   */
  static switchType(severity: Linter.Severity): Linter.StringSeverity
  /**
   * Convert a severity string ('off', 'warn', or 'error') to its numeric equivalent.
   * @param severity the severity string
   * @returns the numeric equivalent of the severity
   */
  static switchType(severity: Linter.StringSeverity): Linter.Severity
  static switchType(severity: Linter.RuleSeverity) {
    switch (severity) {
      case 0: {
        return 'off'
      }
      case 1: {
        return 'warn'
      }
      case 2: {
        return 'error'
      }
      case 'error': {
        return 2
      }
      case 'off': {
        return 0
      }
      case 'warn': {
        return 1
      }
    }
  }
}
