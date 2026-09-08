import { execFileSync } from 'node:child_process'

import { type ExecutorContext, logger } from '@nx/devkit'
import { releasePublish, releaseVersion } from 'nx/release'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReleaseExecutorSchema } from './schema'

import executor from './executor'

vi.mock(import('node:child_process'), () => ({
  execFileSync: vi.fn(),
}))

vi.mock(import('nx/release'), () => ({
  releasePublish: vi.fn(),
  releaseVersion: vi.fn(),
}))

const context = {} as ExecutorContext
const releaseGraph = {} as Awaited<ReturnType<typeof releaseVersion>>['releaseGraph']

function mockVersionData(newVersion: string | null = null) {
  vi.mocked(releaseVersion).mockResolvedValue({
    projectsVersionData: {
      package: {
        currentVersion: '1.0.0',
        dependentProjects: [],
        newVersion,
      },
    },
    releaseGraph,
    workspaceVersion: newVersion,
  })
}

describe('release executor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVersionData('1.0.1')
    vi.mocked(execFileSync).mockReturnValue('123456')
    vi.mocked(releasePublish).mockResolvedValue({ package: { code: 0 } })
  })

  it('previews versioning without requesting an OTP or publishing', async () => {
    const options: ReleaseExecutorSchema = { dryRun: true }

    await expect(executor(options, context)).resolves.toStrictEqual({ success: true })
    expect(releaseVersion).toHaveBeenCalledWith(options)
    expect(execFileSync).not.toHaveBeenCalled()
    expect(releasePublish).not.toHaveBeenCalled()
  })

  it('skips publishing when no new versions are resolved', async () => {
    mockVersionData()

    await expect(executor({}, context)).resolves.toStrictEqual({ success: true })
    expect(execFileSync).not.toHaveBeenCalled()
    expect(releasePublish).not.toHaveBeenCalled()
  })

  it('requests a fresh OTP and publishes the resolved versions', async () => {
    const options: ReleaseExecutorSchema = {
      firstRelease: true,
      groups: ['packages'],
      verbose: true,
    }

    await expect(executor(options, context)).resolves.toStrictEqual({ success: true })
    expect(execFileSync).toHaveBeenCalledWith('op', ['item', 'get', 'NPM', '--otp'], {
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit'],
    })
    expect(releasePublish).toHaveBeenCalledWith({
      firstRelease: true,
      groups: ['packages'],
      otp: 123456,
      projects: undefined,
      releaseGraph,
      verbose: true,
      versionData: expect.any(Object),
    })
  })

  it('fails when publishing fails', async () => {
    vi.mocked(releasePublish).mockResolvedValue({ package: { code: 1 } })

    await expect(executor({}, context)).resolves.toStrictEqual({ success: false })
  })

  it('fails before versioning when groups and projects are both selected', async () => {
    const error = vi.spyOn(logger, 'error').mockReturnValue(undefined)

    await expect(
      executor({ groups: ['packages'], projects: ['package'] }, context),
    ).resolves.toStrictEqual({ success: false })
    expect(releaseVersion).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith(
      'The groups and projects options are mutually exclusive.',
    )
  })

  it('fails without publishing when 1Password returns an invalid OTP', async () => {
    vi.mocked(execFileSync).mockReturnValue('invalid')
    vi.spyOn(logger, 'error').mockReturnValue(undefined)

    await expect(executor({}, context)).resolves.toStrictEqual({ success: false })
    expect(releasePublish).not.toHaveBeenCalled()
  })
})
