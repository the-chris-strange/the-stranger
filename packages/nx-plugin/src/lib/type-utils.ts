/**
 * Get an array of values from a possibly nullish value.
 * @param value the input value
 * @template T the type of value array to return
 * @returns an array of values
 */
export function toArray<T>(value?: (T | null)[] | T | null): T[] {
  if (value === null || value === undefined) {
    return []
  } else if (Array.isArray(value)) {
    return value.flatMap(e => toArray(e))
  } else {
    return [value]
  }
}

/**
 * Exclude `null` from a type, optionally recursively.
 * @template T the type
 * @template R if true, recursively apply the exclusion
 */
export type DeepNonNullable<T, R extends boolean = false> = T extends object
  ? { [K in keyof T]: R extends true ? DeepNonNullable<T[K], R> : Exclude<T[K], null> }
  : Exclude<T, null>

/**
 * Recursively make properties of an object optional.
 * @template T the original type
 */
export type DeepPartial<T> = {
  [K in keyof T]?: (T[K] extends object ? DeepPartial<T[K]> : Partial<T[K]>) | undefined
}

/**
 * Recursively exclude `null` and `undefined` from a type, effectively making the type itself (if it was nullable) and any properties of that type required.
 * @template T the original type
 * @template R if true, recursively apply the exclusion
 */
export type DeepRequired<T, R extends boolean = false> = T extends null | undefined
  ? DeepRequired<Exclude<T, null | undefined>, R>
  : T extends object
    ? {
        [P in keyof T]-?: R extends true
          ? DeepRequired<T[P], R>
          : Exclude<T[P], null | undefined>
      }
    : Exclude<T, null | undefined>

/**
 * Make a type that includes all properties of {@link T}, making the selected properties ({@link K}) optional while keeping the rest of the properties unchanged.
 * @template T the original type
 * @template K the properties to make optional
 * @template R if `true`, recursively apply the transformation
 */
export type ExtendOptional<
  T extends object,
  K extends keyof T,
  R extends boolean = false,
> = Omit<T, K> & PickOptional<T, K, R>

/**
 * Make a type that includes all properties of {@link T}, making the selected properties ({@link K}) required while keeping the rest of the properties unchanged.
 * @template T the original type
 * @template K the properties to make required
 * @template R if `true`, recursively apply the transformation
 */
export type ExtendRequired<
  T extends object,
  K extends keyof T,
  R extends boolean = false,
> = Omit<T, K> & PickRequired<T, K, R>

/**
 * Make a type that includes only selected properties ({@link K}) of {@link T}, all of which are non-nullable.
 * @template T the original type
 * @template K the properties to make non-nullable
 * @template R if true, recursively apply the transformation
 */
export type PickNonNullable<
  T,
  K extends keyof T = keyof T,
  R extends boolean = false,
> = { [P in K]: DeepNonNullable<T[P], R> }

/**
 * Make a type that includes only selected properties ({@link K}) of {@link T}, all of which are optional.
 * @template T the original type
 * @template K properties to make optional
 * @template R if true, recursively apply the transformation
 */
export type PickOptional<T, K extends keyof T = keyof T, R extends boolean = false> = {
  [P in K]?: R extends true ? PickOptional<T[P], keyof T[P], true> : Partial<T[P]>
}

/**
 * Make a type that includes only selected properties ({@link K}) of {@link T}, all of which are required (i.e. not null or undefined).
 * @template T the original type
 * @template K the properties to make required
 * @template R if true, recursively apply the transformation
 */
export type PickRequired<T, K extends keyof T = keyof T, R extends boolean = false> = {
  [P in K]-?: DeepRequired<T[P], R>
}

/**
 * Ensure that at least one property of a type is required.
 * @template T the object type
 * @template K the properties that should be required
 */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> = Omit<T, K> &
  { [P in K]-?: Partial<Record<Exclude<K, P>, undefined>> & PickRequired<T, P> }[K]
