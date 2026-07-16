<script setup lang="ts">
import ReportTable from '@/components/report/ReportTable.vue'
import { useReportStore } from '@/stores/report'
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'

const reportStore = useReportStore()
const voucherStore = useVoucherStore()

const { report, friendlyFilter, statusFilter, startDateFilter, endDateFilter } = storeToRefs(reportStore)

const totalRevenue = computed(() =>
  (report.value ?? []).reduce((sum: number, row: any) => sum + (row.totalVoucherValue ?? 0), 0)
)

onMounted(() => {
  reportStore.$reset()
  startDateFilter.value = `${new Date().getFullYear()}-01-01`
  endDateFilter.value = `${new Date().getFullYear()}-12-31`
  statusFilter.value = ['readyForApproval']
  reportStore.fillReport()
})

async function approveVoucher(id) {
  await useVoucherStore().updateVoucherStatus('approve', id)
}

function rejectVoucher(id, message) {
  voucherStore.updateVoucherStatus('reject', id, message)
}
</script>

<template lang="pug">
main.review-layout
  ReportTable(
    :review="true"
    :report="report ?? []"
    :total-revenue="totalRevenue"
    @approve-voucher="approveVoucher"
    @reject-voucher="rejectVoucher"
  )
</template>

<style lang="scss">
.review-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: 100%;
}
</style>