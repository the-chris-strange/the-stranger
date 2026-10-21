export { makeStringComparator, makeValueComparator } from './lib/compare.js'
export type { ComparatorOptions } from './lib/compare.js'
export {
  buildNamedOrderRanks,
  resolveArrayValueOptions,
  resolveObjectKeyOptions,
  sortArrayValues,
  sortValue,
  toComparatorOpts,
} from './lib/core.js'
export type { ResolvedArrayValueOptions, ResolvedObjectKeyOptions } from './lib/core.js'
export { sortJsonString, sortJsonValue } from './lib/json.js'
export { sortMarkdownFrontmatter } from './lib/markdown.js'
export { packageJsonSortOrder, sortPackageJson } from './lib/package-json.js'
export type { PackageJsonSortOptions } from './lib/package-json.js'
export { matchesPattern, pathToString } from './lib/path.js'
export type { PathSegment } from './lib/path.js'
export type {
  ArrayValueOptions,
  ArrayValueOverride,
  BaseSortOptions,
  NamedKeyOrderItem,
  ObjectKeyOptions,
  ObjectKeyOrderEntry,
  ObjectKeyOverride,
  SortJsonStringOptions,
  SortOptions,
  SortOrder,
} from './lib/types.js'
export { sortYamlString, sortYamlValue } from './lib/yaml.js'
