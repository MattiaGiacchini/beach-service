import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import { getReport } from '@/service/ReportService'
import { type VoucherStatus } from '@/types/VoucherStatus'
import { useServiceUtils } from '@/composables/serviceUtils'

export const useReportStore = defineStore('report', () => {
  const report: Ref<object[] | undefined> = ref([])
  const reportLoading: Ref<boolean> = ref(false)

  const startDateFilter: Ref<any | undefined> = ref(undefined)
  const endDateFilter: Ref<any | undefined> = ref(undefined)
  const friendlyFilter: Ref<boolean> = ref(false)
  const statusFilter: Ref<VoucherStatus[]> = ref([])

  const totalRevenue: Ref<number> = ref(0)

  const { normalizeArrayToUndefined } = useServiceUtils()
  async function fillReport() {
    reportLoading.value = true

    const response: AxiosResponse<object[]> = await getReport(
      startDateFilter.value,
      endDateFilter.value,
      friendlyFilter.value,
      normalizeArrayToUndefined(statusFilter.value)
    )

    if (response) {
      report.value = response

      totalRevenue.value = report.value.reduce(
        (sum, { totalVoucherValue }) => sum + totalVoucherValue,
        0
      )
    }

    reportLoading.value = false
  }

  function $reset() {
    report.value = []
    totalRevenue.value = 0
    startDateFilter.value = undefined
    endDateFilter.value = undefined
    friendlyFilter.value = false
    statusFilter.value = []
  }

  return {
    report,
    fillReport,
    reportLoading,
    totalRevenue,
    startDateFilter,
    endDateFilter,
    friendlyFilter,
    statusFilter,
    $reset
  }
})
