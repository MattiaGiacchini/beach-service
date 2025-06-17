<script setup lang="ts">
import ReportTable from '@/components/report/ReportTable.vue'
import { useReportStore } from '@/stores/report'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const reportStore = useReportStore()
const { startDateFilter, endDateFilter } = storeToRefs(reportStore)

onMounted(() => {
  reportStore.$reset()
  startDateFilter.value = `${new Date().getFullYear()}-01-01`
  endDateFilter.value = `${new Date().getFullYear()}-12-31`
  reportStore.fillReport()
})
</script>

<template lang="pug">
main.report-layout
  ReportTable
</template>

<style lang="scss">
.report-layout {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  height: 100%;
}
</style>
