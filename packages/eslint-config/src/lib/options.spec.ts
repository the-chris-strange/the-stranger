import { describe, expect, it } from 'vitest'

import { resolveOptions } from './options.js'

describe('resolveOptions', () => {
  it('preserves default configuration options', () => {
    expect(resolveOptions()).toStrictEqual({
      json: {
        sort: {
          nx: true,
          tsconfig: true,
          vscode: true,
        },
      },
      nx: undefined,
      source: {
        agentSkills: true,
        js: {
          browser: true,
          node: true,
        },
        jsdoc: true,
        node: true,
        promise: true,
        react: {
          astro: false,
          typeChecked: false,
          typescript: false,
        },
        regexp: true,
        sort: true,
        ts: {
          strict: false,
          typeChecked: true,
          typescript: true,
        },
        unicorn: true,
      },
      tests: undefined,
      toml: undefined,
      yaml: {
        sort: {
          cspellConfig: true,
          dependabotConfig: true,
          githubActions: true,
          markdownlintConfig: true,
          yarnrc: true,
        },
      },
    })
  })

  it('applies boolean and nested overrides with existing precedence', () => {
    expect(
      resolveOptions({
        json: false,
        source: {
          js: false,
          react: true,
          ts: { strict: true },
        },
        yaml: {
          sort: {
            githubActions: false,
          },
        },
      }),
    ).toStrictEqual({
      json: {
        sort: {
          nx: false,
          tsconfig: false,
          vscode: false,
        },
      },
      nx: undefined,
      source: {
        agentSkills: true,
        js: {
          browser: false,
          node: false,
        },
        jsdoc: true,
        node: true,
        promise: true,
        react: {
          astro: true,
          typeChecked: true,
          typescript: true,
        },
        regexp: true,
        sort: true,
        ts: {
          strict: true,
          typeChecked: true,
          typescript: true,
        },
        unicorn: true,
      },
      tests: undefined,
      toml: undefined,
      yaml: {
        sort: {
          cspellConfig: true,
          dependabotConfig: true,
          githubActions: false,
          markdownlintConfig: true,
          yarnrc: true,
        },
      },
    })
  })
})
