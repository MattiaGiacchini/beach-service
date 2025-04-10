import type { Price } from '@/types/Prices'
import { supabase } from '@/composable/supabase'
import { useToast } from 'primevue/usetoast'

async function getReport(
  startDate: string = `${new Date().getFullYear() - 1}-01-01`,
  endDate: string = `${new Date().getFullYear() - 1}-12-31`,
  friendly: boolean = false
): Promise<object[]> {
  const toast = useToast()

  try {
    let { data: report, error } = await supabase
      .from('report')
      .select('*')
      .lt('checkOut', endDate)
      .gt('checkIn', startDate)
      .is('friendly', friendly)

    if (error) {
      throw error
    }

    return report || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error fetching report: ${error.message}`,
      life: 3000
    })

    return []
  }
}
async function getTotalRevenue(
  year: number = new Date().getFullYear() - 1,
  friendly: boolean = false
): Promise<object[]> {
  // const toast = useToast()

  try {
    let { data: total, error } = await supabase
      .from('totalRevenue')
      .select('*')
      .eq('year', year)
      .is('friendly', friendly)

    if (error) {
      throw error
    }

    console.log(total[0])
    return total[0].totalRevenue || 0
  } catch (error) {
    // toast.add({
    //   severity: 'error',
    //   summary: 'Error',
    //   detail: `Error fetching report: ${error.message}`,
    //   life: 3000
    // })

    return []
  }
}

export { getReport, getTotalRevenue }
