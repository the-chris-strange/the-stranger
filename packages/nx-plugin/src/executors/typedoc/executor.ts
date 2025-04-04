import { spawnSync } from 'node:child_process'

import { getPackageManagerCommand, logger, PromiseExecutor } from '@nx/devkit'
import { TypeDocOptions } from 'typedoc'

const runExecutor: PromiseExecutor<Partial<TypeDocOptions>> = async options => {
  logger.debug('Running Typedoc executor', options)
  const pm = getPackageManagerCommand()
  try {
    const result = spawnSync(pm.exec, ['typedoc'])
    const exitCode = result.status ?? 0
    if (exitCode > 0) {
      const err =
        result.error ?? new Error(`failed to execute typedoc; exit code: ${exitCode}`)
      logger.error(err)
      logger.error(result.stderr)
      throw err
    }
    return { success: true }
  } catch (error) {
    logger.error(error)
    return { success: false }
  }
}

export default runExecutor
