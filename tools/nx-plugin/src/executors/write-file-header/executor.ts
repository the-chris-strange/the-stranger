import { type PromiseExecutor } from '@nx/devkit'

import type { WriteFileHeaderExecutorSchema } from './schema'

import { writeHeader } from './write-header'

const runExecutor: PromiseExecutor<WriteFileHeaderExecutorSchema> = async options => {
  const headerContent = Array.isArray(options.header)
    ? options.header.join('\n')
    : options.header
  const header = Buffer.from(`${headerContent.trimEnd()}\n\n`)

  const filesChunks = chunkArray(options.files)

  const result = { success: true }
  for (const chunk of filesChunks) {
    await Promise.all(
      chunk.map(async e => {
        try {
          await writeHeader(e, header)
        } catch {
          result.success = false
        }
      }),
    )
  }

  return result
}

function* chunkArray<T>(arr: T[], chunkSize = 20): Generator<T[]> {
  for (let i = 0; i < arr.length; i += chunkSize) {
    yield arr.slice(i, i + chunkSize)
  }
}

export default runExecutor
