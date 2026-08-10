import type { ConfigureOptions, ESLintConfigSchema } from './schema'

const DEFAULT_CONFIGURE_OPTIONS: ConfigureOptions = {
  json: true,
  nx: true,
  source: {
    agentSkills: true,
    js: true,
    jsdoc: true,
    node: false,
    promise: false,
    react: false,
    regexp: true,
    sort: true,
    ts: { strict: false, typeChecked: false, typescript: true },
    unicorn: true,
  },
  toml: true,
  yaml: true,
} satisfies ConfigureOptions

export function normalizeOptions(options: ESLintConfigSchema): NormalizedOptions {
  const configType = options.configType ?? (options.project ? 'project' : 'workspace')

  if (configType === 'project' && !options.project) {
    throw new Error('Project config generation requires a project name.')
  }

  if (configType === 'project' && options.additionalConfigs?.length) {
    throw new Error('additionalConfigs is only supported for workspace configs.')
  }

  return {
    ...options,
    additionalConfigs: options.additionalConfigs ?? [],
    configType,
    configureOptions: mergeOptions(
      DEFAULT_CONFIGURE_OPTIONS,
      options.configureOptions ?? {},
    ),
  }
}

export type NormalizedOptions = ESLintConfigSchema &
  Required<
    Pick<ESLintConfigSchema, 'additionalConfigs' | 'configType' | 'configureOptions'>
  >

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeOptions(
  base: ConfigureOptions,
  override: ConfigureOptions,
): ConfigureOptions {
  const result: ConfigureOptions = { ...base }

  for (const key of Object.keys(override) as (keyof ConfigureOptions)[]) {
    const value = override[key]

    if (value === undefined) {
      continue
    }

    const current = result[key]
    result[key] = (
      isRecord(current) && isRecord(value) ? mergeRecords(current, value) : value
    ) as never
  }

  return result
}

function mergeRecords(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
) {
  const result: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) {
      continue
    }

    const current = result[key]
    result[key] =
      isRecord(current) && isRecord(value) ? mergeRecords(current, value) : value
  }

  return result
}
