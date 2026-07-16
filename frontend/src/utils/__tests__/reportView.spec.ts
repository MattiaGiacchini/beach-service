import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'

// Stub Supabase so env vars are not required
vi.mock('@/composables/supabase', () => ({ supabase: {} }))

// Stub ReportTable and ReportFilterBar to prevent transitive Pug compilation
vi.mock('@/components/report/ReportTable.vue', () => ({ default: {} }))
vi.mock('@/components/report/ReportFilterBar.vue', () => ({ default: {} }))

import { computeFilteredRevenue } from '@/views/ReportView.vue'

// Feature: report-row-context-menu, Property 8: Revenue recomputation is consistent with visible rows
// Validates: Requirements 5.5

describe('computeFilteredRevenue', () => {
  describe('unit tests', () => {
    it('returns 0 for an empty array', () => {
      expect(computeFilteredRevenue([])).toBe(0)
    })

    it('returns the totalVoucherValue for a single row', () => {
      expect(computeFilteredRevenue([{ totalVoucherValue: 42.5 }])).toBe(42.5)
    })

    it('rows with undefined totalVoucherValue default to 0', () => {
      expect(computeFilteredRevenue([{ totalVoucherValue: undefined }, { totalVoucherValue: 10 }])).toBe(10)
    })
  })

  describe('Property 8: Revenue recomputation is consistent with visible rows', () => {
    it('equals the sum of totalVoucherValue for every row', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({ totalVoucherValue: fc.float({ min: 0, max: 1_000_000, noNaN: true }) }),
          ),
          (rows) => {
            const expected = rows.reduce((sum, row) => sum + row.totalVoucherValue, 0)
            expect(computeFilteredRevenue(rows)).toBeCloseTo(expected, 5)
          },
        ),
        { numRuns: 200 },
      )
    })
  })
})
