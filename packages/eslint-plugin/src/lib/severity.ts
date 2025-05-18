import type { Linter } from '@typescript-eslint/utils/ts-eslint'

export function isSeverity(value: any): value is Linter.Severity {
  return (
    (typeof value === 'string' && ['error', 'off', 'warn'].includes(value)) ||
    (typeof value === 'number' && value >= 0 && value <= 2)
  )
}

export function remapRules(
  severity: Linter.Severity,
  rules: Partial<Linter.RulesRecord>,
): Linter.RulesRecord {
  const ruleArray: [string, Linter.RuleEntry][] = Object.entries(rules).map(
    ([key, value]) => [key, setRuleSeverity(severity, value)],
  )
  return Object.fromEntries(ruleArray)
}

export function setRuleSeverity(
  severity: Linter.Severity,
  rule?: Linter.RuleEntry,
): Linter.RuleEntry {
  if (isSeverity(rule)) {
    return severity
  }

  if (Array.isArray(rule)) {
    return rule.length === 1 ? [severity] : [severity, ...rule.slice(1)]
  }

  throw new Error('This should never happen; if it does, your eslint config is broken.')
}

export function setSeverity(severity: Linter.Severity, config: Linter.Config[]) {
  return config.flatMap(configObject => {
    if (configObject.rules) {
      configObject.rules = remapRules(severity, configObject.rules)
    }
    return {
      ...configObject,
      rules: configObject.rules ? remapRules(severity, configObject.rules) : undefined,
    }
  })
}
