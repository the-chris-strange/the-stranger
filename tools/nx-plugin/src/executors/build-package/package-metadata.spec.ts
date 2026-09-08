import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { workspaceRoot } from '@nx/devkit'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { finalizeBuildMetadata, finalizePublishManifest } from './package-metadata'

describe('package metadata finalization', () => {
  const outputPath = join(workspaceRoot, 'tmp/build-package-metadata')

  beforeEach(async () => {
    await rm(outputPath, { force: true, recursive: true })
    await mkdir(outputPath, { recursive: true })
  })

  afterAll(async () => {
    await rm(outputPath, { force: true, recursive: true })
  })

  it('makes build manifest paths relative to the dist package root', async () => {
    await writeFile(
      join(outputPath, 'package.json'),
      JSON.stringify({
        exports: {
          '.': { import: './dist/index.js', types: './dist/index.d.ts' },
          './package.json': './package.json',
        },
        files: ['dist', 'docs'],
        main: './dist/index.js',
        module: './dist/index.js',
        name: 'example',
        types: './dist/index.d.ts',
      }),
    )

    await finalizeBuildMetadata(outputPath)

    const manifest = JSON.parse(
      await readFile(join(outputPath, 'package.json'), 'utf8'),
    )
    expect(manifest).toMatchObject({
      exports: {
        '.': { import: './index.js', types: './index.d.ts' },
        './package.json': './package.json',
      },
      main: './index.js',
      module: './index.js',
      types: './index.d.ts',
    })
    expect(manifest).not.toHaveProperty('files')
  })

  it('makes copied Nx collection paths relative to dist', async () => {
    await writeFile(join(outputPath, 'package.json'), '{}')
    await writeFile(
      join(outputPath, 'executors.json'),
      JSON.stringify({
        executors: {
          example: {
            implementation: './src/executors/example/executor',
            schema: './src/executors/example/schema.json',
          },
        },
      }),
    )

    await finalizeBuildMetadata(outputPath)

    const collection = JSON.parse(
      await readFile(join(outputPath, 'executors.json'), 'utf8'),
    )
    expect(collection.executors.example).toMatchObject({
      implementation: './executors/example/executor',
      schema: './executors/example/schema.json',
    })
  })

  it('points publish manifests at collections inside dist', () => {
    expect(
      finalizePublishManifest({
        executors: './executors.json',
        generators: './generators.json',
        name: 'example',
      }),
    ).toMatchObject({
      executors: './dist/executors.json',
      generators: './dist/generators.json',
    })
  })
})
