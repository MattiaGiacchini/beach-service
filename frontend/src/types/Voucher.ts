export type VoucherCreation = {
  bsNumber: number
  customerName: string
  checkIn: string
  checkOut: string
  beds: number
  umbrellas: number
  roomNumber: number
  friendly: boolean
}

export type Voucher = {
  id: string
  bsNumber: number
  customerName: string
  checkIn: string
  checkOut: string
  beds: number
  umbrellas: number
  roomNumber: number
  friendly: boolean
  voucherStatus: string
  created_at: string
}

export type VoucherPeriodDetails = {
  voucherId: string
  periodId: string
  umbrellasVariation: number
  bedsVariation: number
  days: number
}
