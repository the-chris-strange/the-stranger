import jsdocPlugin from 'eslint-plugin-jsdoc'
import tseslintPlugin from 'typescript-eslint'

import type { ConfigOptions } from '../configure.js'
import type { ConfigWithExtends, InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'
import { languageOptions } from './language-options.js'
import { typeCheckedRules } from './rulesets/type-checked.js'
import { typescriptRules } from './rulesets/typescript.js'

export function configureTs({
  jsdoc,
  ts,
}: ConfigOptions['source']): ConfigWithExtends[] {
  if (!Object.values(ts).includes(true)) {
    return []
  }

  const config = {
    extends: [] as InfiniteConfigArray[],
    files: getFilePatterns(FilePatterns.ts),
    languageOptions: undefined as ConfigWithExtends['languageOptions'],
    name: namer('typescript/base'),
    rules: typescriptRules,
  } satisfies ConfigWithExtends

  if (ts.typeChecked)
    config.extends.push(
      tseslintPlugin.configs[`${ts.strict ? 'strict' : 'recommended'}TypeCheckedOnly`],
    )

  if (jsdoc) {
    config.extends.push(jsdocPlugin.configs['flat/recommended-typescript'])
  }

  if (ts.typeChecked) {
    config.languageOptions = languageOptions
    config.rules = { ...config.rules, ...typeCheckedRules }
  }

  return [config]
}
