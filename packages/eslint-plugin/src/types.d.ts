declare module 'eslint-plugin-promise' {
  import type { Linter, Rule } from 'eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, Rule.RuleModule>
  const configs: {
    'flat/recommended': Linter.Config
  }
  export default { configs, meta, rules }
}

declare module 'eslint-plugin-eslint-plugin' {
  import type { Linter, Rule } from 'eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, Rule.RuleModule>
  const configs: {
    'flat/recommended': Linter.Config
  }
  export default { configs, meta, rules }
}

declare module 'eslint-plugin-cypress' {
  import type { Linter, Rule } from 'eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, Rule.RuleModule>
  const configs: {
    recommended: Linter.Config
  }

  export default { configs, rules }
}

declare module 'eslint-plugin-cypress/flat' {
  import type { Linter, Rule } from 'eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, Rule.RuleModule>
  const configs: {
    recommended: Linter.Config
  }

  export default { configs, meta, rules }
}
