declare module 'eslint-plugin-promise' {
  import type { Linter, Rule } from 'eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, Rule.RuleModule>
  const configs: {
    'flat/recommended': Linter.Config
  }
  export default { configs, meta, rules }
}
