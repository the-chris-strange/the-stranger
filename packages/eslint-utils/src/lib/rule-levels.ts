import type { Linter } from 'eslint'

/**
 * Encapsulate operations on rule levels.
 * @internal
 */
export class RuleLevels {
  /**
   * The numeric rule level - 0, 1, or 2.
   */
  readonly severity: Severity
  /**
   * The text rule level - 'off', 'warn', or 'error'.
   */
  readonly severityString: StringSeverity

  private static readonly severityLevels: Severity[] = [0, 1, 2]

  constructor(severity: RuleSeverity) {
    if (RuleLevels.isSeverity(severity)) {
      this.severity = severity
      this.severityString = RuleLevels.switchType(severity)
    } else {
      this.severityString = severity
      this.severity = RuleLevels.switchType(severity)
    }
  }

  /**
   * Get the numeric severity level of a rule. The rule may be in array form or a bare numeric or string severity.
   * @param rule the rule entry
   * @returns the numeric severity of the rule
   */
  static severityOf(rule: RuleEntry): Severity {
    if (Array.isArray(rule)) {
      return RuleLevels.severityOf(rule[0])
    }

    return RuleLevels.isSeverity(rule) ? rule : RuleLevels.switchType(rule)
  }

  /**
   * Convert a numeric rule level (0, 1, or 2) to its string equivalent.
   * @param severity the numeric rule level
   * @returns the string equivalent of the rule level
   */
  static switchType(severity: Severity): StringSeverity
  /**
   * Convert a severity string ('off', 'warn', or 'error') to its numeric equivalent.
   * @param severity the severity string
   * @returns the numeric equivalent of the severity
   */
  static switchType(severity: StringSeverity): Severity
  static switchType(severity: RuleSeverity) {
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

  /**
   * Set the rule level/severity of a configuration rule, preserving the type of the original value. If this instance is 'warn' or 'error', options are preserved in the resulting entry.
   * @param entry a rule entry
   * @returns the rule entry with the updated severity
   */
  setLevel(entry: RuleEntry): RuleEntry {
    if (Array.isArray(entry)) {
      const newLevel = this.matchType(entry[0])
      return this.severity === 0 ? newLevel : [newLevel, ...entry.slice(1)]
    }
    return this.matchType(entry)
  }

  /**
   * Check is a severity level is the numeric value (i.e. 0, 1, or 2).
   * @param severity the severity level (numeric) or severity name (string)
   * @returns true if the severity level is the numeric value; false otherwise
   */
  private static isSeverity(severity: RuleSeverity): severity is Severity {
    return typeof severity === 'number' && RuleLevels.severityLevels.includes(severity)
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
  private matchType(level: RuleSeverity): RuleSeverity {
    if (RuleLevels.isSeverity(level)) {
      return this.severity
    }
    return this.severityString
  }
}

type RuleEntry = Linter.RuleEntry
type RuleSeverity = Linter.RuleSeverity
type Severity = Linter.Severity
type StringSeverity = Linter.StringSeverity
