import type { Linter } from 'eslint'

import type { InfiniteConfigArray } from './extend-config.js'

import { RuleLevels } from './rule-levels.js'
import { ruleMatcher, type RuleMatcher } from './rule-matcher.js'

/**
 * Set the severity of rules in an ESLint configuration. If {@link ruleSelector} is specified, only matching rules are changed. Rules that are already disabled are left alone by default; use the {@link force} option to override.
 * @param config a configuration object
 * @param severity the severity to set
 * @param ruleSelector an array of rule names or a function that accepts a rule name and returns a boolean value indicating whether the rule should be changed
 * @param force override the default behavior of leaving disabled rules off
 * @returns the configuration object with the specified severity
 */
export function setSeverity<T extends InfiniteConfigArray>(
  config: T,
  severity: Linter.RuleSeverity | RuleLevels,
  ruleSelector?: RuleMatcher | string[],
  force?: boolean,
): T {
  const levels = severity instanceof RuleLevels ? severity : new RuleLevels(severity)
  const selector =
    typeof ruleSelector === 'function' ? ruleSelector : ruleMatcher(ruleSelector)

  if (Array.isArray(config)) {
    return config.map(e => setSeverity(e, levels, selector, force)) as T
  }

  if (config.rules) {
    for (const [key, value] of Object.entries(config.rules)) {
      if (
        value &&
        RuleLevels.severityOf(value) !== levels.severity &&
        selector(key) &&
        (force || levels.severity === 0 || RuleLevels.severityOf(value) !== 0)
      ) {
        config.rules[key] = levels.setLevel(value)
      }
    }
  }

  if (config.extends) {
    config.extends = config.extends.map(e =>
      typeof e === 'string' ? e : setSeverity(e, levels, selector, force),
    )
  }

  return config
}
