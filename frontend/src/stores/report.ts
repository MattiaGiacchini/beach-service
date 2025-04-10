import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import { getReport, getTotalRevenue } from '@/service/ReportService'

export const useReportStore = defineStore('report', () => {
  const report: Ref<object[] | undefined> = ref([])
  const reportLoading: Ref<boolean> = ref(false)

  const totalRevenue: Ref<number> = ref(0)

  async function fillReport() {
    reportLoading.value = true

    const reportResponse: AxiosResponse<object[]> = await getReport()

    if (reportResponse) {
      report.value = reportResponse
    }

    const revenueResponse: AxiosResponse<object[]> = await getTotalRevenue()

    if (revenueResponse) {
      totalRevenue.value = revenueResponse
    }

    reportLoading.value = false
  }

  async function fillTotalRevenue() {
    reportLoading.value = true

    const response: AxiosResponse<object[]> = await getTotalRevenue()

    if (response) {
      totalRevenue.value = response
    }

    reportLoading.value = false
  }

  return {
    report,
    fillReport,
    reportLoading,
    fillTotalRevenue,
    totalRevenue
  }
})
