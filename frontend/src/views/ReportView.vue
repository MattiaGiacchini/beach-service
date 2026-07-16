<script lang="ts">
export function applySearchFilter(rows: any[], query: string): any[] {
  const q = query.trim()
  if (!q) return rows
  const lower = q.toLowerCase()
  const numericId = /^\d+$/.test(q) ? parseInt(q, 10) : null
  return rows.filter((row: any) => {
    const nameMatch = row.customerName?.toLowerCase().includes(lower)
    const bsMatch = numericId !== null && row.bsNumber === numericId
    return nameMatch || bsMatch
  })
}

export function computeFilteredRevenue(rows: any[]): number {
  return rows.reduce((sum: number, row: any) => sum + (row.totalVoucherValue ?? 0), 0)
}
</script>

<script setup lang="ts">
import ReportTable from '@/components/report/ReportTable.vue'
import ReportFilterBar from '@/components/report/ReportFilterBar.vue'
import { useReportStore } from '@/stores/report'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const reportStore = useReportStore()
const { report, startDateFilter, endDateFilter } = storeToRefs(reportStore)

const searchQuery = ref<string>('')

const filteredReport = computed<object[]>(() => {
  return applySearchFilter(report.value ?? [], searchQuery.value)
})

const filteredRevenue = computed<number>(() => {
  return computeFilteredRevenue(filteredReport.value)
})

onMounted(() => {
  reportStore.$reset()
  searchQuery.value = ''
  startDateFilter.value = `${new Date().getFullYear()}-01-01`
  endDateFilter.value = `${new Date().getFullYear()}-12-31`
  reportStore.fillReport()
})
</script>

<template lang="pug">
main.report-layout
  div.report-table
    ReportTable(:report="filteredReport" :total-revenue="filteredRevenue")
      template(#title)
        ReportFilterBar(@search="searchQuery = $event")
</template>

<style scoped lang="scss">
.report-layout {
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.report-table {
  flex: 1;
  height: 0; /* forces flex child to respect parent bounds */
  min-height: 0;
}
</style>