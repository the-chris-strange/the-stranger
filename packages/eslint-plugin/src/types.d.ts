declare module 'eslint-plugin-promise' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, RuleModule>
  const configs: {
    'flat/recommended': FlatConfig.Config
  }
  export default { configs, meta, rules }
}

declare module 'eslint-plugin-eslint-plugin' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, RuleModule>
  const configs: {
    'flat/recommended': FlatConfig.Config
  }
  export default { configs, meta, rules }
}

declare module 'eslint-plugin-cypress' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const rules: Record<string, RuleModule>
  const configs: {
    recommended: FlatConfig.Config
  }

  export default { configs, rules }
}

declare module 'eslint-plugin-cypress/flat' {
  import type { FlatConfig, RuleModule } from '@typescript-eslint/utils/ts-eslint'

  const meta: { name: string; version: string }
  const rules: Record<string, RuleModule>
  const configs: {
    recommended: FlatConfig.Config
  }

  export default { configs, meta, rules }
}
