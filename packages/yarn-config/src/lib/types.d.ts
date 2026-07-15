import type { Yarn as yarn } from '@yarnpkg/types'

/**
 * Options applicable to any constraint function.
 */
export interface ConstraintOptions {
  /**
   * Enable updating private projects as well as public ones.
   * @default false
   */
  includePrivate?: boolean
}

export type Dependency = yarn.Constraints.Dependency

export type Workspace = yarn.Constraints.Workspace

export type Yarn = yarn.Constraints.Yarn
