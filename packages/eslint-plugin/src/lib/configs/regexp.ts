import re from 'eslint-plugin-regexp'
import { defineConfig } from 'eslint/config'
import { objectNamer } from '../namer'

export default defineConfig(
  objectNamer(re.configs['flat/recommended'], 're-recommended'),
)
