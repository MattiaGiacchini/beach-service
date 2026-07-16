import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { mapVoucherToFormProps, isEditFormValid, buildCompanionVoucher } from '../voucherFormUtils'
import type { Voucher } from '@/types/Voucher'

// ---------------------------------------------------------------------------
// Shared arbitraries
// ---------------------------------------------------------------------------

/** Generates a full Voucher object with all required fields. */
const voucherArb = fc.record<Voucher>({
  id: fc.string({ minLength: 1 }),
  bsNumber: fc.integer({ min: 1, max: 9999 }),
  customerName: fc.string({ minLength: 1 }),
  checkIn: fc.constant('2024-06-01'),
  checkOut: fc.constant('2024-06-07'),
  beds: fc.integer({ min: 0, max: 20 }),
  umbrellas: fc.integer({ min: 0, max: 10 }),
  roomNumber: fc.integer({ min: 0, max: 500 }),
  friendly: fc.boolean(),
  voucherStatus: fc.constantFrom('active', 'cancelled'),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

/** Generates a Voucher with friendly fixed to false (BS voucher). */
const bsVoucherArb = fc.record<Voucher>({
  id: fc.string({ minLength: 1 }),
  bsNumber: fc.integer({ min: 1, max: 9999 }),
  customerName: fc.string({ minLength: 1 }),
  checkIn: fc.constant('2024-06-01'),
  checkOut: fc.constant('2024-06-07'),
  beds: fc.integer({ min: 0, max: 20 }),
  umbrellas: fc.integer({ min: 0, max: 10 }),
  roomNumber: fc.integer({ min: 0, max: 500 }),
  friendly: fc.constant(false),
  voucherStatus: fc.constantFrom('active', 'cancelled'),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

// ---------------------------------------------------------------------------
// Property 4: Form props mapping preserves all seven fields
// Feature: report-row-context-menu, Property 4: Form props mapping preserves all seven fields
// Validates: Requirements 3.1
// ---------------------------------------------------------------------------

describe('mapVoucherToFormProps', () => {
  it('Property 4: mapVoucherToFormProps preserves all seven editable fields', () => {
    fc.assert(
      fc.property(voucherArb, (v) => {
        const props = mapVoucherToFormProps(v)

        expect(props.bsNumber).toBe(v.bsNumber)
        expect(props.roomNumber).toBe(v.roomNumber)
        expect(props.customerName).toBe(v.customerName)
        expect(props.umbrellas).toBe(v.umbrellas)
        expect(props.beds).toBe(v.beds)
        expect(props.checkIn).toBe(v.checkIn)
        expect(props.checkOut).toBe(v.checkOut)
        expect(props.friendly).toBe(v.friendly)
      }),
      { numRuns: 100 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 5: Edit form validation is correct for all field combinations
// Feature: report-row-context-menu, Property 5: Edit form validation is correct for all field combinations
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------

describe('isEditFormValid', () => {
  /**
   * Nullable date arbitrary: generates either null or a Date instance.
   * fc.oneof is used because fast-check v4 fc.option returns undefined by default,
   * not null — and the function signature expects Date | null.
   */
  const nullableDateArb = fc.oneof(fc.constant(null), fc.date())

  it('Property 5: returns true iff bsNumber >= 1 AND integer, customerName non-empty, both dates non-null', () => {
    fc.assert(
      fc.property(
        fc.record({
          bsNumber: fc.integer({ min: -100, max: 9999 }),
          customerName: fc.string(),
          checkIn: nullableDateArb,
          checkOut: nullableDateArb,
        }),
        (state) => {
          const result = isEditFormValid(state)

          const bsValid =
            Number.isInteger(state.bsNumber) && state.bsNumber >= 1
          const nameValid = state.customerName.trim().length > 0
          const checkInValid = state.checkIn !== null
          const checkOutValid = state.checkOut !== null
          const expected = bsValid && nameValid && checkInValid && checkOutValid

          expect(result).toBe(expected)
        },
      ),
      { numRuns: 200 },
    )
  })

  it('returns true for a valid combination', () => {
    expect(
      isEditFormValid({
        bsNumber: 1,
        customerName: 'Mario',
        checkIn: new Date('2024-06-01'),
        checkOut: new Date('2024-06-07'),
      }),
    ).toBe(true)
  })

  it('returns false when bsNumber is 0', () => {
    expect(
      isEditFormValid({
        bsNumber: 0,
        customerName: 'Mario',
        checkIn: new Date(),
        checkOut: new Date(),
      }),
    ).toBe(false)
  })

  it('returns false when bsNumber is a float', () => {
    expect(
      isEditFormValid({
        bsNumber: 1.5,
        customerName: 'Mario',
        checkIn: new Date(),
        checkOut: new Date(),
      }),
    ).toBe(false)
  })

  it('returns false when customerName is whitespace only', () => {
    expect(
      isEditFormValid({
        bsNumber: 1,
        customerName: '   ',
        checkIn: new Date(),
        checkOut: new Date(),
      }),
    ).toBe(false)
  })

  it('returns false when checkIn is null', () => {
    expect(
      isEditFormValid({ bsNumber: 1, customerName: 'Mario', checkIn: null, checkOut: new Date() }),
    ).toBe(false)
  })

  it('returns false when checkOut is null', () => {
    expect(
      isEditFormValid({ bsNumber: 1, customerName: 'Mario', checkIn: new Date(), checkOut: null }),
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Property 6: Companion voucher fields are fully determined by the source voucher
// Feature: report-row-context-menu, Property 6: Companion voucher fields are fully determined by source voucher
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------

describe('buildCompanionVoucher', () => {
  it('Property 6: companion voucher fields are fully determined by the source BS voucher', () => {
    fc.assert(
      fc.property(bsVoucherArb, (v) => {
        const companion = buildCompanionVoucher(v)

        expect(companion.bsNumber).toBe(v.bsNumber)
        expect(companion.checkIn).toBe(v.checkIn)
        expect(companion.checkOut).toBe(v.checkIn) // checkOut == checkIn (same day)
        expect(companion.customerName).toBe('ANNULLATO')
        expect(companion.beds).toBe(0)
        expect(companion.umbrellas).toBe(0)
        expect(companion.friendly).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('sets customerName to ANNULLATO', () => {
    const v: Voucher = {
      id: '1',
      bsNumber: 42,
      customerName: 'Rossi',
      checkIn: '2024-07-01',
      checkOut: '2024-07-07',
      beds: 2,
      umbrellas: 1,
      roomNumber: 5,
      friendly: false,
      voucherStatus: 'active',
      created_at: '2024-01-01T00:00:00Z',
    }
    const companion = buildCompanionVoucher(v)
    expect(companion.customerName).toBe('ANNULLATO')
    expect(companion.beds).toBe(0)
    expect(companion.umbrellas).toBe(0)
    expect(companion.friendly).toBe(false)
    expect(companion.checkOut).toBe(v.checkIn)
  })
})
