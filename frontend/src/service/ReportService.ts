import { supabase } from '@/composables/supabase'
import { useToastMessage } from '@/composables/toastMessage'

const { showErrorToast } = useToastMessage()

async function getReport(
  startDate: string = `${new Date().getFullYear() - 1}-01-01`,
  endDate: string = `${new Date().getFullYear() - 1}-12-31`,
  friendly: boolean = false
): Promise<object[]> {
  try {
    const { data, error } = await supabase
      .from('report')
      .select('*')
      .lt('checkOut', endDate)
      .gt('checkIn', startDate)
      .is('friendly', friendly)

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
