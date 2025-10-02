# @the-stranger/eslint-plugin

ESLint plugin, which mostly consists of common configurations that I use in various circumstances.

## Provided Configurations

This plugin offers a set of ready-to-use ESLint configurations for common scenarios:

- **Cypress**: Provides `eslint-plugin-cypress` recommended config for Cypress test files.
- **JSDoc**: Includes recommended JSDoc rules for both TypeScript and JavaScript, with custom settings for `@document` tags used by Docusaurus.
- **Node (n)**: Provides recommended rules for Node.js projects using `eslint-plugin-n`.
- **Nx**: Provides Nx module boundaries enforcement and integrates Nx plugin configs for JavaScript/TypeScript projects.
- **Perfectionist**: Applies sorting and organization rules from `eslint-plugin-perfectionist` for classes, enums, exports, etc.
- **Promise**: Adds recommended rules from `eslint-plugin-promise` and custom rules for promise handling.
- **Regexp**: Enables recommended rules from `eslint-plugin-regexp`.
- **TOML**: Configures TOML file linting using `eslint-plugin-toml` and `toml-eslint-parser`.
- **TypeScript ESLint**: Sets up TypeScript-specific rules, disables some noisy rules, and adapts config if Nx plugin is present.
- **Unicorn**: Applies recommended rules from `eslint-plugin-unicorn`, with certain .
- **Vitest**: Integrates recommended rules for Vitest test files.
- **YAML**: Enables recommended YAML linting rules using `eslint-plugin-yml` and `yaml-eslint-parser`.
