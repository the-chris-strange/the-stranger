import { stat } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'

import { createDefineConfig, loadConfig } from 'c12'
import { createDefu } from 'defu'

import type { SortJsonStringOptions } from '@the-stranger/ordered'
import type { InputConfig, LoadConfigOptions } from 'c12'

export type ChaoticConfig = InputConfig<
  SortJsonStringOptions & { extends?: string | string[] }
>

export const defineConfig = createDefineConfig<
  SortJsonStringOptions & { extends?: string | string[] }
>()

// Replacing arrays prevents inherited rules from taking precedence over local rules.
const merge = createDefu((object, key, value) => {
  if (!Array.isArray(value)) return false
  Object.assign(object, { [key]: [...value] })
  return true
})

export async function resolveConfig(
  cwd: string,
  configFile: string | undefined,
  overrides: SortJsonStringOptions,
): Promise<SortJsonStringOptions> {
  const explicit = configFile === undefined ? undefined : resolve(cwd, configFile)
  if (explicit && !(await stat(explicit)).isFile()) {
    throw new Error(`Configuration is not a file: ${explicit}`)
  }
  let sources = 0
  const options: LoadConfigOptions<ChaoticConfig> = {
    configFile: explicit ? basename(explicit) : 'chaotic.config',
    configFileRequired: explicit !== undefined,
    cwd: explicit ? dirname(explicit) : cwd,
    dotenv: false,
    giget: false,
    globalRc: false,
    merger: (...layers) => {
      for (const layer of layers) {
        if (layer !== undefined) validateConfig(layer)
      }
      return merge({}, ...layers)
    },
    omit$Keys: true,
    overrides,
    packageJson: false,
    rcFile: false,
    async resolve(source, context) {
      // c12 otherwise warns and ignores missing layers, and has no cycle bound.
      if (++sources > 64)
        throw new Error('Configuration exceeds 64 layers (possible extends cycle)')
      if (source === '.') return
      const path = resolve(context.cwd ?? cwd, source)
      let isDirectory = false
      try {
        isDirectory = (await stat(path)).isDirectory()
      } catch {
        // Required configuration loading reports missing paths below.
      }
      const layer = await loadConfig<ChaoticConfig>({
        ...context,
        configFile: isDirectory ? 'chaotic.config' : basename(path),
        configFileRequired: true,
        cwd: isDirectory ? path : dirname(path),
        extend: false,
        overrides: undefined,
        resolve: undefined,
      })
      validateConfig(layer.config)
      return layer
    },
  }
  const loaded = await loadConfig(options)
  validateConfig(loaded.config)
  return loaded.config
}

type Validator = (value: unknown) => boolean
const boolean: Validator = value => typeof value === 'boolean'
const string: Validator = value => typeof value === 'string'
const strings: Validator = value => Array.isArray(value) && value.every(string)
const count: Validator = value =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0
const direction: Validator = value => value === 'asc' || value === 'desc'
const comparator = { caseSensitive: boolean, natural: boolean, order: direction }
const objectKeys = { ...comparator, allowLineSeparatedGroups: boolean, minKeys: count }
const arrayValues = {
  ...comparator,
  key: string,
  keys: strings,
  minValues: count,
  serialize: boolean,
  sortObjectKeysBeforeSerialize: boolean,
}

function entries(
  value: unknown,
  fields: Record<string, Validator>,
  required: string,
): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      entry =>
        object(entry, fields) &&
        typeof (entry as Record<string, unknown>)[required] === 'string',
    )
  )
}

function object(
  value: unknown,
  fields: Record<string, Validator>,
  reserved = false,
): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  for (const [key, setting] of Object.entries(value)) {
    if (
      setting === undefined ||
      (reserved && (key.startsWith('$') || key === '_layers'))
    )
      continue
    if (!Object.hasOwn(fields, key) || !fields[key](setting)) {
      throw new Error(`Invalid configuration option: ${key}`)
    }
  }
  return true
}

function validateConfig(value: unknown): asserts value is ChaoticConfig {
  const valid = object(
    value,
    {
      arrayValues: section =>
        object(section, {
          ...arrayValues,
          overrides: overrides =>
            entries(overrides, { ...arrayValues, pathPattern: string }, 'pathPattern'),
        }),
      extends: sources => string(sources) || strings(sources),
      indent: indent => string(indent) || (count(indent) && (indent as number) <= 10),
      objectKeys: section =>
        object(section, {
          ...objectKeys,
          overrides: overrides =>
            entries(
              overrides,
              {
                ...objectKeys,
                order: order =>
                  direction(order) ||
                  (Array.isArray(order) &&
                    order.every(
                      entry =>
                        string(entry) ||
                        (object(entry, { ...comparator, key: string }) &&
                          string((entry as Record<string, unknown>)['key'])),
                    )),
                pathPattern: string,
              },
              'pathPattern',
            ),
        }),
    },
    true,
  )
  if (!valid) throw new Error('Configuration must contain an options object')
}
