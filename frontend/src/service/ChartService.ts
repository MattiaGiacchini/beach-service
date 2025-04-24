import { supabase } from '@/composables/supabase'
import { useToastMessage } from '@/composables/toastMessage'
import type { MonthlyRevenueEntry } from '@/types/Chart'

const { showErrorToast } = useToastMessage()

async function getMonthlyRevenue(): Promise<MonthlyRevenueEntry[]> {
  try {
    const { data, error } = await supabase.from('monthlyRevenue').select('*')

    if (error) throw error

    return data || []
  } catch (error: any) {
    showErrorToast(error)
    return []
  }
}

async function getYearlyStats(): Promise<MonthlyRevenueEntry[]> {
  try {
    const { data, error } = await supabase.from('yearlyStats').select('*')

    if (error) throw error

    return data || []
  } catch (error: any) {
    showErrorToast(error)
    return []
  }
}

export { getMonthlyRevenue, getYearlyStats }
