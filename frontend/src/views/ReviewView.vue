<script setup lang="ts">
import ReportTable from '@/components/report/ReportTable.vue'
import { useReportStore } from '@/stores/report'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'

const reportStore = useReportStore()
const voucherStore = useVoucherStore()

const { friendlyFilter, statusFilter } = storeToRefs(reportStore)

onMounted(() => {
  reportStore.$reset()
  statusFilter.value = ['draft']
  reportStore.fillReport()
})

async function approveVoucher(id) {
  await useVoucherStore().updateVoucherStatus('approve', id)
}

function rejectVoucher(id, message) {
  voucherStore.updateVoucherStatus('reject', id, 'the checkin is wrong')
}
</script>

<template lang="pug">
main.report-layout
  ReportTable(:review="true" @approve-voucher="approveVoucher", @reject-voucher="rejectVoucher")
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
