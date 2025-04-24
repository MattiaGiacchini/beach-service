import { supabase } from '@/composables/supabase'
import type { Voucher, VoucherCreation, VoucherPeriodDetails } from '@/types/Voucher'
import { useToastMessage } from '@/composables/toastMessage'
const { showErrorToast } = useToastMessage()

async function getLastVouchers(limit = 10): Promise<Voucher[] | null> {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select()
      .order('checkIn', { ascending: false })
      .order('bsNumber', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function getVoucherById(voucherId: string): Promise<Voucher | null> {
  try {
    const { data, error } = await supabase.from('vouchers').select().eq('id', voucherId).single()

    if (error) throw error

    return data
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function createVoucher(voucher: VoucherCreation): Promise<Voucher | null> {
  try {
    const { data, error } = await supabase.from('vouchers').insert([voucher]).select()

    if (error) throw error

    return data?.[0] ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}
async function createVoucherPeriodsDetails(
  periods: VoucherPeriodDetails[]
): Promise<Voucher | null> {
  try {
    const { data, error } = await supabase.from('voucher-pricing-details').insert(periods).select()

    if (error) throw error

    return data?.[0] ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function getLastVoucherNumber(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('bsNumber')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    return data?.[0]?.bsNumber ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function getOldCustomersNames() {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('customerName')
      .order('customerName', { ascending: true })
      .range(0, 10_000)

    if (error) throw error

    return data ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

export {
  getLastVoucherNumber,
  getVoucherById,
  getLastVouchers,
  createVoucher,
  createVoucherPeriodsDetails,
  getOldCustomersNames
}
