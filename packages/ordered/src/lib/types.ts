export interface ArrayValueOptions extends BaseSortOptions {
  key?: string
  keys?: string[]
  minValues?: number
  serialize?: boolean
  sortObjectKeysBeforeSerialize?: boolean
}

export interface ArrayValueOverride extends ArrayValueOptions {
  pathPattern: string
}

export interface BaseSortOptions {
  caseSensitive?: boolean
  natural?: boolean
  order?: SortOrder
}

export interface NamedKeyOrderItem {
  /** The exact property name to pin at this rank. */
  key: string
  caseSensitive?: boolean
  natural?: boolean
  /**
   * Per-entry comparator settings. When any entry in the named-order list
   * specifies these, they become the comparator used for keys that are NOT
   * pinned by name (last entry that specifies wins). This lets you write
   * `[{ key: "name" }, { key: "version" }, { key: "scripts", natural: true }]`
   * to pin three keys and request natural sort for the rest.
   */
  order?: SortOrder
}

export interface ObjectKeyOptions extends BaseSortOptions {
  allowLineSeparatedGroups?: boolean
  minKeys?: number
}

export type ObjectKeyOrderEntry = string | NamedKeyOrderItem

export interface ObjectKeyOverride extends Omit<ObjectKeyOptions, 'order'> {
  pathPattern: string
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
