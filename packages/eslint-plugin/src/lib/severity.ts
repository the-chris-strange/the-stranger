import type { Linter } from 'eslint'
import { RuleLevels } from './rule-levels'

/**
 * Set the severity of rules in an ESLint configuration. If {@link rules} is specified, only rules with a key that matches one of these values is changed.
 * @param severity the severity to set
 * @param config a configuration object
 * @param rules an array of rule names or rules within the configuration object
 * @returns the configuration object with the specified severity
 */
export function setRuleLevel(severity: Severity, config: Config, rules?: string[]) {
  const levels = new RuleLevels(severity)
  const includeKey = (key: string) => rules?.find(e => matchKeys(e, key)) ?? true

  if (config.rules) {
    config.rules = Object.entries(config.rules).reduce(
      (acc, [key, rule]) => {
        if (rule !== undefined) {
          acc[key] = includeKey(key) ? levels.setLevel(rule) : rule
        }
        return acc
      },
      Object.create(null) as Record<string, RuleEntry>,
    )
  }
  return config
}

type Severity = Linter.RuleSeverity

function matchKeys(lhs: string, rhs: string) {
  if (lhs === rhs) {
    return true
  }

  if (lhs.startsWith('@')) {
    const [ns, rn] = lhs.split('/')
    return [ns, ns.slice(1), rn].includes(rhs)
  }

  if (rhs.startsWith('@')) {
    return lhs.startsWith(rhs)
  }

  return false
}

type Config = Linter.Config

type RuleEntry = Linter.RuleEntry
