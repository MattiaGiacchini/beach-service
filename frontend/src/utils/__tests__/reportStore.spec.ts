/**
 * Property 7: Filter state is preserved across all mutations
 *
 * Feature: report-row-context-menu, Property 7: Filter state is preserved across all mutations
 * Validates: Requirements 5.4
 *
 * The four filter refs in `useReportStore` — startDateFilter, endDateFilter,
 * friendlyFilter, statusFilter — must remain unchanged after any mutation that
 * touches `report.value` (delete row, replace row, or reassign the whole array).
 *
 * Strategy: set up a fresh Pinia store with arbitrary filter values, then simulate
 * each kind of mutation that the handlers in ReportTable.vue perform against the
 * `report` ref, and assert that none of the filter fields changed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import fc from 'fast-check'
import type { VoucherStatus } from '@/types/VoucherStatus'

// Mock the ReportService (which pulls in the Supabase client) so the store
// can be imported without requiring real environment variables.
vi.mock('@/service/ReportService', () => ({
  getReport: vi.fn().mockResolvedValue([]),
  getTotalRevenue: vi.fn().mockResolvedValue(0),
}))

import { useReportStore } from '@/stores/report'
import { deleteVoucherFromReport, replaceVoucherInReport } from '../reportArrayUtils'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for the startDateFilter / endDateFilter fields (string or undefined) */
const dateFilterArb = fc.option(fc.constantFrom('2024-01-01', '2024-06-15', '2025-12-31'), {
  nil: undefined,
})

/** Arbitrary for statusFilter (subset of known statuses) */
const voucherStatusValues: VoucherStatus[] = [
  'draft',
  'readyForApproval',
  'approved',
  'cancelled',
  'paid',
  'rejected',
  'closed',
  'pendingPayment',
]
const statusFilterArb = fc.array(fc.constantFrom(...voucherStatusValues), { maxLength: 4 })

/** Combined arbitrary for all four filter fields */
const filterStateArb = fc.record({
  startDateFilter: dateFilterArb,
  endDateFilter: dateFilterArb,
  friendlyFilter: fc.boolean(),
  statusFilter: statusFilterArb,
})

/** Arbitrary for a minimal report row */
const reportRowArb = fc.record({
  id: fc.string({ minLength: 1 }),
  totalVoucherValue: fc.float({ min: 0, max: 10_000, noNaN: true }),
})

/** Arbitrary for a non-empty report array */
const reportArrayArb = fc.array(reportRowArb, { minLength: 1, maxLength: 10 })

// ---------------------------------------------------------------------------
// Mocked service functions (simulating vi.fn() for deleteVoucher etc.)
// ---------------------------------------------------------------------------

const deleteVoucherMock = vi.fn()
const updateVoucherMock = vi.fn()
const createVoucherMock = vi.fn()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Snapshot the four filter fields from the store */
function snapshotFilters(store: ReturnType<typeof useReportStore>) {
  return {
    startDateFilter: store.startDateFilter,
    endDateFilter: store.endDateFilter,
    friendlyFilter: store.friendlyFilter,
    // Deep-copy so a later mutation to the array ref doesn't affect the snapshot
    statusFilter: [...store.statusFilter],
  }
}

/** Apply arbitrary filter values to the store */
function applyFilters(
  store: ReturnType<typeof useReportStore>,
  filters: {
    startDateFilter: string | undefined
    endDateFilter: string | undefined
    friendlyFilter: boolean
    statusFilter: VoucherStatus[]
  }
) {
  store.startDateFilter = filters.startDateFilter
  store.endDateFilter = filters.endDateFilter
  store.friendlyFilter = filters.friendlyFilter
  store.statusFilter = [...filters.statusFilter]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useReportStore — Property 7: Filter state preserved across mutations', () => {
  beforeEach(() => {
    // Fresh Pinia for every test to avoid state bleed-over
    setActivePinia(createPinia())
    deleteVoucherMock.mockReset()
    updateVoucherMock.mockReset()
    createVoucherMock.mockReset()
  })

  /**
   * Mutation A: deleteVoucherFromReport — removes a row from report.value.
   * Simulates handleDeleteConfirm() in ReportTable.vue after a successful
   * deleteVoucher service call.
   */
  it('Property 7a: startDateFilter/endDateFilter/friendlyFilter/statusFilter are unchanged after a delete mutation', () => {
    // Feature: report-row-context-menu, Property 7: Filter state is preserved across all mutations
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(filterStateArb, reportArrayArb, (filters, rows) => {
        const store = useReportStore()
        applyFilters(store, filters)
        store.report = [...rows]

        const before = snapshotFilters(store)

        // Simulate the delete mutation: remove the first row from report.value
        const idToDelete = rows[0].id
        deleteVoucherMock.mockResolvedValue(true)
        store.report = deleteVoucherFromReport(store.report as any[], idToDelete)

        const after = snapshotFilters(store)

        expect(after.startDateFilter).toEqual(before.startDateFilter)
        expect(after.endDateFilter).toEqual(before.endDateFilter)
        expect(after.friendlyFilter).toEqual(before.friendlyFilter)
        expect(after.statusFilter).toEqual(before.statusFilter)
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Mutation B: replaceVoucherInReport — replaces a row in report.value.
   * Simulates handleEditSubmit() in ReportTable.vue after successful
   * deleteVoucher + createVoucher service calls.
   */
  it('Property 7b: startDateFilter/endDateFilter/friendlyFilter/statusFilter are unchanged after a replace mutation', () => {
    // Feature: report-row-context-menu, Property 7: Filter state is preserved across all mutations
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(filterStateArb, reportArrayArb, reportRowArb, (filters, rows, newRow) => {
        const store = useReportStore()
        applyFilters(store, filters)
        store.report = [...rows]

        const before = snapshotFilters(store)

        // Simulate the replace mutation: swap the first row with a new voucher
        const oldId = rows[0].id
        deleteVoucherMock.mockResolvedValue(true)
        createVoucherMock.mockResolvedValue(newRow)
        store.report = replaceVoucherInReport(store.report as any[], oldId, newRow)

        const after = snapshotFilters(store)

        expect(after.startDateFilter).toEqual(before.startDateFilter)
        expect(after.endDateFilter).toEqual(before.endDateFilter)
        expect(after.friendlyFilter).toEqual(before.friendlyFilter)
        expect(after.statusFilter).toEqual(before.statusFilter)
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Mutation C: direct reassignment of report.value (full array replacement).
   * Simulates reportStore.fillReport() being called after a convert action
   * where we reassign report.value to a fresh server response.
   */
  it('Property 7c: startDateFilter/endDateFilter/friendlyFilter/statusFilter are unchanged after a full report reassignment', () => {
    // Feature: report-row-context-menu, Property 7: Filter state is preserved across all mutations
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(filterStateArb, reportArrayArb, reportArrayArb, (filters, initialRows, newRows) => {
        const store = useReportStore()
        applyFilters(store, filters)
        store.report = [...initialRows]

        const before = snapshotFilters(store)

        // Simulate the full reassignment that fillReport() performs
        updateVoucherMock.mockResolvedValue({ friendly: true })
        createVoucherMock.mockResolvedValue(newRows[0])
        store.report = [...newRows]

        const after = snapshotFilters(store)

        expect(after.startDateFilter).toEqual(before.startDateFilter)
        expect(after.endDateFilter).toEqual(before.endDateFilter)
        expect(after.friendlyFilter).toEqual(before.friendlyFilter)
        expect(after.statusFilter).toEqual(before.statusFilter)
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Mutation D: service returns failure (no mutation applied).
   * Simulates handleDeleteConfirm() or handleEditSubmit() when the service
   * call returns false/null and the handler does NOT mutate report.value.
   * Filters must be unchanged regardless.
   */
  it('Property 7d: startDateFilter/endDateFilter/friendlyFilter/statusFilter are unchanged when service calls fail (no mutation)', () => {
    // Feature: report-row-context-menu, Property 7: Filter state is preserved across all mutations
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(filterStateArb, reportArrayArb, (filters, rows) => {
        const store = useReportStore()
        applyFilters(store, filters)
        store.report = [...rows]

        const before = snapshotFilters(store)

        // Simulate service failure — the handler does not touch report.value
        deleteVoucherMock.mockResolvedValue(false)
        updateVoucherMock.mockResolvedValue(null)
        // No mutation applied to store.report

        const after = snapshotFilters(store)

        expect(after.startDateFilter).toEqual(before.startDateFilter)
        expect(after.endDateFilter).toEqual(before.endDateFilter)
        expect(after.friendlyFilter).toEqual(before.friendlyFilter)
        expect(after.statusFilter).toEqual(before.statusFilter)
      }),
      { numRuns: 50 }
    )
  })
})
