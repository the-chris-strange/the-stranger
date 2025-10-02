import cypress from 'eslint-plugin-cypress/flat'
import { defineConfig } from 'eslint/config'

export default defineConfig(cypress.configs.recommended)
