export function useServiceUtils() {
  function normalizeArrayToUndefined<T>(array?: T[]): T[] | undefined {
    return array && array.length > 0 ? array : undefined
  }

  return { normalizeArrayToUndefined }
}
