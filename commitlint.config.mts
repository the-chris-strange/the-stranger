import {
  createProjectGraphAsync,
  readProjectsConfigurationFromProjectGraph,
} from '@nx/devkit'

import type { UserConfig } from '@commitlint/types'

const graph = await createProjectGraphAsync()
const { projects } = readProjectsConfigurationFromProjectGraph(graph)
const scopes = ['release', ...Object.keys(projects)]

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'scope-enum': [2, 'always', scopes],
  },
} satisfies UserConfig
