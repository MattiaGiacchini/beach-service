/**
 * Pure utility functions for mutating the in-memory report array.
 * All functions are immutable — they return a new array and leave the original unchanged.
 */

/**
 * Returns a new array with the row matching `id` removed.
 * If no row matches, the original array contents are returned unchanged.
 *
 * Requirements: 2.3, 5.1
 */
export function deleteVoucherFromReport(report: any[], id: string): any[] {
  return report.filter((row) => row.id !== id)
}

/**
 * Returns a new array of the same length with the row whose `id` equals `oldId`
 * replaced by `newVoucher`. If no row matches `oldId`, the original contents are
 * returned unchanged (same length, no replacement).
 *
 * Requirements: 3.7, 5.2
 */
export function replaceVoucherInReport(report: any[], oldId: string, newVoucher: any): any[] {
  return report.map((row) => (row.id === oldId ? newVoucher : row))
}
