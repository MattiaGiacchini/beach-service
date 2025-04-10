<script setup lang="ts">
import { usePricesStore } from '@/stores/prices'
import VoucherForm from '@/components/vouchers/VoucherForm.vue'
import VoucherList from '@/components/vouchers/VoucherList.vue'

usePricesStore().fillPrices()
</script>

<template lang="pug">
main.voucher-layout
  VoucherForm
  VoucherList
</template>

<style lang="scss">
.voucher-layout {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 59.4px);
}
</style>
