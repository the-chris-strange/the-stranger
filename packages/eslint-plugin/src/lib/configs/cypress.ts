import type { ConfigBuilder } from '../config-builder'

export const cypressConfig: ConfigBuilder = async (...configs) => {
  try {
    const cypress = await import('eslint-plugin-cypress/flat')
    return [cypress.default.configs.recommended, ...configs.flat()]
  } catch {
    return []
  }
}

/**
 * Default configuration for [eslint-plugin-cypress](https://github.com/cypress-io/eslint-plugin-cypress#readme).
 */
export default await cypressConfig()
