import type { defineConfig } from 'eslint/config'

/**
 * ESLint configuration object with the `extends` property - which is the shape that ESLint's {@link defineConfig} utility function accepts both as a direct argument and as elements in the `extends` array. I'm exporting it here because it's useful and, for some reason, is not exported from `eslint/config`.
 */
export type ConfigWithExtends = Exclude<InfiniteConfigArray, any[]>

/**
 * Either a configuration object or an array of them. I use this to define the {@link ConfigWithExtends} type so that type maintains compatibility with what {@link defineConfig} accepts.
 */
export type InfiniteConfigArray = Parameters<typeof defineConfig>[0]
