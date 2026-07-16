export function useDateFilterUtils() {

  /** Returns the number of days in a given month of a given year. */
  function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate()
  }

  /** Returns true if the month/day combination is valid for the given year. */
  function isValidMonthDay(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12) return false
    if (day < 1) return false
    return day <= daysInMonth(year, month)
  }

  /**
   * Returns null if the range is valid (min <= max or one side is null),
   * or an error message string if minDate ordinal > maxDate ordinal.
   */
  function validateRange(
    min: { month: number; day: number } | null,
    max: { month: number; day: number } | null
  ): string | null {
    if (!min || !max) return null
    const minOrdinal = min.month * 100 + min.day
    const maxOrdinal = max.month * 100 + max.day
    return minOrdinal > maxOrdinal
      ? `Start date (${min.month}/${min.day}) must not be after end date (${max.month}/${max.day})`
      : null
  }

  /**
   * Constructs an ISO 8601 date string from year, month, and day.
   * Assumes all inputs are already validated.
   */
  function buildISODate(year: number, month: number, day: number): string {
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  return { daysInMonth, isValidMonthDay, validateRange, buildISODate }
}