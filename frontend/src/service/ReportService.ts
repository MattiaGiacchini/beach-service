import { supabase } from '@/composables/supabase'
import { useToastMessage } from '@/composables/toastMessage'
import type { VoucherStatus } from '@/types/VoucherStatus'
import { useTimeUtils } from '@/composables/timeUtils'

const { showErrorToast } = useToastMessage()

async function getReport(
  startDate: string,
  endDate: string,
  friendly: boolean = false,
  voucherStatuses?: VoucherStatus[]
): Promise<object[]> {
  try {
    // const { data, error } = await supabase
    //   .from('report')
    //   .select('*')
    //   .lt('checkOut', endDate)
    //   .gt('checkIn', startDate)
    //   .is('friendly', friendly)
    //   .in('voucherStatus', voucherStatuses)

    const { data, error } = await supabase.rpc('report', {
      start_date: startDate,
      end_date: endDate,
      is_friendly: friendly,
      status_list: voucherStatuses
    })

    if (error) throw error

    return data || []
  } catch (error: any) {
    showErrorToast(error)
    return []
  }
}

async function getTotalRevenue(
  year: number = new Date().getFullYear() - 1,
  friendly: boolean = false
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('totalRevenue')
      .select('*')
      .eq('year', year)
      .is('friendly', friendly)

    if (error) throw error

    return data?.[0]?.totalRevenue ?? 0
  } catch (error: any) {
    showErrorToast(error)
    return 0
  }
}

export { getReport, getTotalRevenue }
