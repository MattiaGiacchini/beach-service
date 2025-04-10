<script setup lang="ts">
import ReportTable from '@/components/report/ReportTable.vue'
import { useReportStore } from '@/stores/report'
import { onMounted } from 'vue'

onMounted(async () => {
  await useReportStore().fillReport()
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
