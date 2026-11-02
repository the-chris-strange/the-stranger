export interface ArrayValueOptions extends BaseSortOptions {
  key?: string
  keys?: string[]
  minValues?: number
  /**
   * Values to place before the remaining sorted array values.
   */
  priority?: string[]
  serialize?: boolean
  sortObjectKeysBeforeSerialize?: boolean
}

export interface ArrayValueOverride extends ArrayValueOptions {
  pathPattern: string | RegExp
}

export interface BaseSortOptions {
  caseSensitive?: boolean
  order?: SortOrder
  /**
   * String comparison mode; defaults to locale collation.
   */
  sortType?: SortType
}

/**
 * Pin a property and optionally update comparison settings for unlisted keys.
 * Later entries override the settings they explicitly supply.
 */
export interface NamedKeyOrderItem extends BaseSortOptions {
  /**
   * The exact property name to pin at this rank.
   */
  key: string
}

export interface ObjectKeyOptions extends BaseSortOptions {
  allowLineSeparatedGroups?: boolean
  minKeys?: number
  /**
   * Sort named keys by moving inverted entries; retain unlisted keys' relative order.
   */
  preserveUnknownKeys?: boolean
}

export type ObjectKeyOrderEntry = string | NamedKeyOrderItem

export interface ObjectKeyOverride extends Omit<ObjectKeyOptions, 'order'> {
  pathPattern: string | RegExp
  order?: ObjectKeyOrderEntry[] | SortOrder
}

export interface SortJsonStringOptions extends SortOptions {
  indent?: number | string
}

export interface SortOptions {
  arrayValues?: ArrayValueOptions & {
    overrides?: ArrayValueOverride[]
  }
  objectKeys?: ObjectKeyOptions & {
    overrides?: ObjectKeyOverride[]
  }
}

export type SortOrder = 'asc' | 'desc'

export type SortType = 'lexical' | 'locale' | 'natural'
