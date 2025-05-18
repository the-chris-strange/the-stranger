declare module 'eslint-plugin-promise' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const rules: Record<string, RuleModule>
  const configs: {
    'flat/recommended': FlatConfig.Config
  }
  export default { configs, rules }
}

declare module 'eslint-plugin-eslint-plugin' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const rules: Record<string, RuleModule>
  const configs: {
    'flat/recommended': FlatConfig.Config
  }
  export default { configs, rules }
}
