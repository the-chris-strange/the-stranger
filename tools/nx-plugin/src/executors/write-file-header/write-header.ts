import { createReadStream, createWriteStream } from 'node:fs'
import { rename, unlink } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

import { logger } from '@nx/devkit'
import { exists } from '@the-stranger/nx-plugin'

export async function writeHeader(filepath: string, header: Buffer<ArrayBuffer>) {
  if (!exists(filepath)) {
    return
  }

  const tmpFile = `${filepath}.tmp`
  const readStream = createReadStream(filepath)
  const writeStream = createWriteStream(tmpFile)

  try {
    writeStream.write(header)

    await pipeline(readStream, writeStream)

    await rename(tmpFile, filepath)
  } catch (err) {
    logger.error(err)
    await unlink(tmpFile).catch(error => {
      logger.error(error)
    })
    throw err
  }
}
