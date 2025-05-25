import { ConfigBuilder } from '../config-builder'

export const cypressConfig: ConfigBuilder = async () => {
  try {
    const cypress = await import('eslint-plugin-cypress/flat')
    return cypress.default.configs.recommended
  } catch {
    return
  }
}
