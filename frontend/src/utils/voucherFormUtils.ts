import type { Voucher, VoucherCreation, VoucherFormInitialValues } from '@/types/Voucher'

/**
 * Maps a Voucher object to the VoucherFormInitialValues shape expected by VoucherForm.vue
 * in edit mode. All seven editable fields are copied from the source voucher.
 *
 * Validates: Requirements 3.1 (Property 4)
 */
export function mapVoucherToFormProps(voucher: Voucher): VoucherFormInitialValues {
  return {
    bsNumber: voucher.bsNumber,
    roomNumber: voucher.roomNumber,
    customerName: voucher.customerName,
    umbrellas: voucher.umbrellas,
    beds: voucher.beds,
    checkIn: voucher.checkIn,
    checkOut: voucher.checkOut,
    friendly: voucher.friendly,
  }
}

/**
 * Builds a companion "ANNULLATO" VoucherCreation for the convert-to-A flow.
 * The companion shares bsNumber and checkIn with the source voucher, sets
 * checkOut equal to checkIn (same-day), and marks the stay as cancelled.
 *
 * Validates: Requirements 4.3 (Property 6)
 */
export function buildCompanionVoucher(voucher: Voucher): VoucherCreation {
  return {
    bsNumber: voucher.bsNumber,
    customerName: 'ANNULLATO',
    checkIn: voucher.checkIn,
    checkOut: voucher.checkIn,
    beds: 0,
    umbrellas: 0,
    roomNumber: 0,
    friendly: false,
  }
}

/**
 * Returns true iff all of the following hold:
 *  - bsNumber is a positive integer (>= 1 and no fractional part)
 *  - customerName is non-empty after trimming whitespace
 *  - checkIn is non-null
 *  - checkOut is non-null
 *
 * Validates: Requirements 3.4 (Property 5)
 */
export function isEditFormValid(state: {
  bsNumber: number | null
  customerName: string
  checkIn: Date | null
  checkOut: Date | null
}): boolean {
  if (state.bsNumber === null) return false
  if (!Number.isInteger(state.bsNumber) || state.bsNumber < 1) return false
  if (state.customerName.trim().length === 0) return false
  if (state.checkIn === null) return false
  if (state.checkOut === null) return false
  return true
}
