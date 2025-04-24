<script lang="ts" setup>
import type { Price } from '@/types/Prices'
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useTimeUtils } from '@/composables/timeUtils'
import { useVoucherStore } from '@/stores/voucher'

const voucherStore = useVoucherStore()
const { voucherLoading, lastVouchers } = storeToRefs(voucherStore)

const { localizedShortDateTime } = useTimeUtils()

const onRowEditSave = async (event) => {
  const { newData } = event

  await pricesStore.modifyPrice(newData)
}
</script>

<template lang="pug">
div.list-container
  Card
    template(#title) Last vouchers
    template(#content).list
      DataTable(
        :value="lastVouchers"
        :loading="voucherLoading"
        :striped-rows="true"
        :scrollable="true"
        data-key="id"
        scroll-height="flex"
        lazy
      )

        Column(field="bsNumber" header="BS Number").center-text
        Column(field="customerName" header="Customer Name").center-text

        Column(field="checkIn" header="Check-in").center-text
          template(#body="slotProps") {{useTimeUtils().localizedShortDateTime(slotProps.data.checkIn)}}

        Column(field="checkOut" header="Check out" ).center-text
          template(#body="slotProps") {{useTimeUtils().localizedShortDateTime(slotProps.data.checkOut)}}

        Column(field="umbrellas" header="Umbrellas").center-text
        Column(field="beds" header="Beds").center-text
</template>

<style lang="scss">
.list-container {
  flex: 1;
  max-height: 100%;

  div.p-card.p-component,
  div.p-card-body {
    height: 100%;

    div.p-card-content {
      height: calc(100% - 33.59px);
    }
  }
}
</style>
