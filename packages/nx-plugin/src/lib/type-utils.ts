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
    // return value.filter(e => e !== null)
  } else {
    return [value]
  }
}

/**
 * Utility type to recursively make all properties of an object non-nullable.
 * @template T the original type
 */
export type DeepNonNullable<T> = T extends object
  ? { [K in keyof T]-?: DeepNonNullable<NonNullable<T[K]>> }
  : NonNullable<T>

/**
 * Utility type to make specific properties of an object required while keeping the rest of the properties unchanged. Required properties are typed using the {@link DeepNonNullable} utility type.
 * @template T the original type
 * @template K the keys that should be required
 */
export type DeepNonNullableProperties<T, K extends keyof T> = T & {
  [P in K]-?: DeepNonNullable<T[P]>
}

/**
 * Utility type to make specific properties of an object required while keeping the rest of the properties unchanged. Required properties are typed using the {@link NonNullable} utility type.
 * @template T the original type
 * @template K the keys that should be required
 */
export type NonNullableProperties<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>
}

/**
 * Utility type to pick specific properties from an object and make them required using the {@link NonNullable} utility type.
 * @template T the original type
 * @template K the keys that should be required
 */
export type PickNonNullableProperties<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>
}

/**
 * Pick specific properties from an object and make them required.
 * @template T the original type
 * @template K the properties that should be required
 * @template R if true, recursively make the resulting properties non-nullable
 */
export type PickRequiredProperties<T, K extends keyof T, R extends boolean = false> = {
  [P in K]-?: R extends true ? DeepNonNullable<T[P]> : NonNullable<T[P]>
}

/**
 * Make some properties of an object required while keeping the rest of the properties unchanged.
 * @template T the original type
 * @template K the properties that should be required
 * @template R if true, recursively make the resulting properties non-nullable
 */
export type RequiredProperties<T, K extends keyof T, R extends boolean = false> = Omit<
  T,
  K
> &
  PickRequiredProperties<T, K, R>
