import { resolve } from 'node:path'

import { type AsyncIteratorExecutor, type ExecutorContext, logger } from '@nx/devkit'
import { getExecutorInformation } from '@nx/devkit/internal'

import type { BuildPackageExecutorSchema } from './schema'

import { finalizeBuildMetadata } from './package-metadata'

async function* runExecutor(
  options: BuildPackageExecutorSchema,
  context: ExecutorContext,
) {
  const { implementationFactory } = getExecutorInformation(
    '@nx/js',
    'tsc',
    context.root,
    context.projectsConfigurations.projects,
  )
  const tscExecutor =
    implementationFactory() as AsyncIteratorExecutor<BuildPackageExecutorSchema>

  for await (const result of tscExecutor(options, context)) {
    if (!result.success) {
      yield result
      continue
    }

    try {
      await finalizeBuildMetadata(resolve(context.root, options.outputPath))
      yield result
    } catch (error) {
      logger.error(error)
      yield { success: false }
    }
  }
}

export default runExecutor
