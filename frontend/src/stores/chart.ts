import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import { getReport } from '@/service/ReportService'
import { getMonthlyRevenue, getYearlyStats } from '@/service/ChartService'
import type { MonthlyRevenueEntry } from '@/types/Chart'
import { useMonthlyRevenueChart } from '@/composables/chartUtils'

export const useChartStore = defineStore('chart', () => {
  const monthlyRevenueData: Ref<MonthlyRevenueEntry[] | undefined> = ref([])
  const friendlyMonthlyRevenue = ref()
  const nonFriendlyMonthlyRevenue = ref()

  const yearlyStatsData: Ref<MonthlyRevenueEntry[] | undefined> = ref([])

  const yearlyRevenue = ref()
  const yearlyVoucherAmount = ref()
  const yearlyPeopleAmount = ref()

  const chartLoading: Ref<boolean> = ref(false)

  const { monthlyRevenue, yearlyStats } = useMonthlyRevenueChart()

  async function fillMonthlyRevenue() {
    chartLoading.value = true

    const response: AxiosResponse<MonthlyRevenueEntry[]> = await getMonthlyRevenue()

    if (response) {
      monthlyRevenueData.value = response

      friendlyMonthlyRevenue.value = monthlyRevenue(monthlyRevenueData.value, 'friendly')

      nonFriendlyMonthlyRevenue.value = monthlyRevenue(monthlyRevenueData.value, 'nonFriendly')
    }

    chartLoading.value = false
  }

  async function fillYearlyStats() {
    chartLoading.value = true

    const response: AxiosResponse<MonthlyRevenueEntry[]> = await getYearlyStats()

    if (response) {
      yearlyStatsData.value = response

      const result = yearlyStats(yearlyStatsData.value)

      yearlyRevenue.value = result.yearlyRevenueCharts
      yearlyVoucherAmount.value = result.yearlyVoucherCharts
      yearlyPeopleAmount.value = result.peopleChart
    }

    chartLoading.value = false
  }

  return {
    monthlyRevenueData,
    fillMonthlyRevenue,
    fillYearlyStats,
    chartLoading,
    friendlyMonthlyRevenue,
    nonFriendlyMonthlyRevenue,
    yearlyRevenue,
    yearlyVoucherAmount,
    yearlyPeopleAmount
  }
})
