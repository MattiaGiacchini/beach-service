<script lang="ts" setup>
import type { Price } from '@/types/Prices'
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useTimeUtils } from '@/composable/timeUtils'
import { useCurrencyUtils } from '@/composable/currencyUtils'

const pricesStore = usePricesStore()
const { pricesLoading, prices, editingPrices } = storeToRefs(pricesStore)

const { localizedShortDateTime } = useTimeUtils()
const { formatCurrency } = useCurrencyUtils()
</script>

<template lang="pug">
div.list-container
  Card
    template(#title) Prices
    template(#content).list
      DataTable(
        v-model:editing-rows="editingPrices"
        :value="prices"
        data-key="id"
        :scrollable="true"
        scroll-height="flex"
        lazy
        :loading="pricesLoading"
      )

        Column(field="startDate" header="Start Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.start_date) }}
        Column(field="endDate" header="End Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.end_date) }}
        Column(field="price" header="Price")
          template(#body='{ data, field }')
            p.currency-field {{formatCurrency(data.price)}}
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
