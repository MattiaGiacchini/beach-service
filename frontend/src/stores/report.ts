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

    const response: AxiosResponse<object[]> = await getReport()

    if (response) {
      report.value = response

      totalRevenue.value = report.value.reduce(
        (sum, { totalVoucherValue }) => sum + totalVoucherValue,
        0
      )
    }

    reportLoading.value = false
  }

  return {
    report,
    fillReport,
    reportLoading,
    totalRevenue
  }
})
