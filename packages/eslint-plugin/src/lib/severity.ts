import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { config, ConfigLike } from './config'

const severityMap: Map<SeverityNumber, SeverityString> = new Map([
  [0, 'off'],
  [1, 'warn'],
  [2, 'error'],
])
const severityStrings = new Set(severityMap.values())

/**
 * Check if the given value is a valid Severity number or string.
 * @param value the value to check
 * @returns true if the value is a Severity; false otherwise
 */
export function isSeverity(value: any): value is Severity {
  return isSeverityNumber(value) || isSeverityString(value)
}

/**
 * Check if the given value is a severity number (0, 1, or 2).
 * @param value the value to check
 * @returns true if the value is a severity number; false otherwise
 */
export function isSeverityNumber(value: any): value is SeverityNumber {
  return typeof value === 'number' && value >= 0 && value <= 2
}

/**
 * Check if the given value is a severity string ('off', 'warn', or 'error').
 * @param value the value to check
 * @returns true if the value is a severity string; false otherwise
 */
export function isSeverityString(value: any): value is SeverityString {
  return typeof value === 'string' && severityStrings.has(value as SeverityString)
}

/**
 * Set the severity of all rules in a configuration object.
 * @param severity the severity to set
 * @param config a configuration object
 * @returns the configuration object with the specified severity set for all rules
 */
export function setConfigSeverity(
  severity: Severity,
  config: FlatConfig.Config,
): FlatConfig.Config {
  if (config.rules) {
    const ruleArray: [string, FlatConfig.RuleEntry][] = Object.entries(config.rules)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        setRuleSeverity(severity, value as FlatConfig.RuleEntry),
      ])
    return { ...config, rules: Object.fromEntries(ruleArray) }
  }
  return config
}

/**
 * Set the severity of a single rule entry.
 * @param severity the severity to set
 * @param rule a rule entry from a configuration object
 * @returns the rule entry with the specified severity set
 */
export function setRuleSeverity(
  severity: Severity,
  rule: FlatConfig.RuleEntry,
): FlatConfig.RuleEntry {
  if (isSeverity(rule)) {
    return toSeverity(severity)
  }

  if (Array.isArray(rule)) {
    rule[0] = toSeverity(severity)
  }

  return rule
}

/**
 * Set the severity of all rules in a configuration object or array of configurations.
 * @param severity the severity to set
 * @param configs an array of configuration objects or a single configuration object
 * @returns an array of configuration objects with the specified severity set for all rules
 */
export async function setSeverity(
  severity: Severity,
  ...configs: ConfigLike[]
): Promise<FlatConfig.ConfigArray> {
  const flatConfigs = await config(...configs)
  return flatConfigs.map(e => setConfigSeverity(severity, e))
}

/**
 * Convert a severity value to a severity string.
 * @param value the value to convert
 * @returns the corresponding severity string, or 'off' if the value is not a valid severity
 */
export function toSeverity(value: any): SeverityString {
  if (isSeverityString(value)) {
    return value
  }

  return severityMap.get(value) ?? 'off'
}

export type Severity = FlatConfig.Severity | FlatConfig.SeverityString

export type SeverityNumber = FlatConfig.Severity

export type SeverityString = FlatConfig.SeverityString
