import type { TestUserConfig } from 'vitest/config'

import type { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Options for the Vitest configuration generator.
 */
export interface VitestConfigSchema extends GeneratorSchema {
  /**
   * The name of the project in which to generate a vitest config.
   */
  project: string
  /**
   * Specify a path to write coverage reports, relative to the workspace root.
   * @default '.reports/coverage'
   */
  coveragePath?: string
  /**
   * Coverage provider to use.
   * @default 'v8'
   */
  coverageProvider?: Exclude<TestUserConfig['coverage'], undefined>['provider']
  /**
   * Allow vitest to inject jest-like API's into the testing environment.
   * @default false
   */
  globals?: boolean
  /**
   * Include setup for writing tests directly in source code files, rather than creating separate *.spec files.
   */
  inSourceTests?: boolean
  /**
   * Skip updating the project's tsconfig.json files.
   */
  skipTsconfigs?: boolean
  /**
   * The testing environment for the project.
   * @default 'node'
   */
  testEnvironment?: TestUserConfig['environment']
}
