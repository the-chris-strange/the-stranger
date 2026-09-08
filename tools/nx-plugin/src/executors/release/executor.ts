import { execFileSync } from 'node:child_process'

import { type PromiseExecutor, logger } from '@nx/devkit'
import { releasePublish, releaseVersion } from 'nx/release'

import type { ReleaseExecutorSchema } from './schema'

const runExecutor: PromiseExecutor<ReleaseExecutorSchema> = async options => {
  try {
    validateOptions(options)

    const { projectsVersionData, releaseGraph } = await releaseVersion(options)

    if (options.dryRun) {
      logger.warn(
        'The dry run made no changes and did not request an npm one-time password.',
      )
      return { success: true }
    }

    if (!hasNewVersion(projectsVersionData)) {
      logger.info('No new versions were resolved; skipped publishing.')
      return { success: true }
    }

    const results = await releasePublish({
      firstRelease: options.firstRelease,
      groups: options.groups,
      otp: getNpmOtp(),
      projects: options.projects,
      releaseGraph,
      verbose: options.verbose,
      versionData: projectsVersionData,
    })

    return {
      success: Object.values(results).every(({ code }) => code === 0),
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : error)
    return { success: false }
  }
}

function getNpmOtp(): number {
  const otp = execFileSync('op', ['item', 'get', 'NPM', '--otp'], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'inherit'],
  }).trim()

  if (!/^\d{6}$/.test(otp)) {
    throw new Error('1Password did not return a six-digit npm one-time password.')
  }

  return Math.trunc(Number(otp))
}

function hasNewVersion(
  projectsVersionData: Awaited<
    ReturnType<typeof releaseVersion>
  >['projectsVersionData'],
): boolean {
  return Object.values(projectsVersionData).some(
    ({ dockerVersion, newVersion }) =>
      typeof dockerVersion === 'string' || typeof newVersion === 'string',
  )
}

function validateOptions(options: ReleaseExecutorSchema): void {
  if (options.groups?.length && options.projects?.length) {
    throw new Error('The groups and projects options are mutually exclusive.')
  }
}

export default runExecutor
