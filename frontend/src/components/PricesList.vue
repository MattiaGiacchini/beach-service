<script lang="ts" setup>
import type { Price } from '@/types/Prices'
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useTimeUtils } from '@/composable/timeUtils'

const pricesStore = usePricesStore()
const { pricesLoading, prices, editingPrices } = storeToRefs(pricesStore)

const { localizedShortDateTime } = useTimeUtils()

const onRowEditSave = async (event) => {
  const { newData } = event

  await pricesStore.modifyPrice(newData)
}

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const show = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 5000 })
}
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
        edit-mode="row"
        @row-edit-save="onRowEditSave"
      )

        Column(field="startDate" :sortable="true" header="Start Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.start_date) }}
        Column(field="endDate" header="End Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.end_date) }}
        Column(field="price" header="Price")
          template(#body='{ data, field }') {{data.price}}
          template(#editor='{ data, field }')
            InputNumber(
              v-model='data.price'
              input-id="price"
              :step='0.5'
              :min='0'
              mode='currency'
              currency='EUR'
            )
        Column(:row-editor="true" )


        Button(label="Show" @click="show()")




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
