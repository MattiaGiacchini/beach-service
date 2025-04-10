<script lang="ts" setup>
import type { Price } from '@/types/Prices'
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useTimeUtils } from '@/composable/timeUtils'

const pricesStore = usePricesStore()
const { pricesLoading, prices, expandedPrices, editingPrices } = storeToRefs(pricesStore)

const { localizedShortDateTime } = useTimeUtils()

const onRowEditSave = async (event) => {
  const { newData } = event

  await pricesStore.modifyPrice(newData)
}
</script>

<template lang="pug">
div.list-container
  Card
    template(#title) Prices
    template(#content).list
      DataTable(
        v-model:expanded-row-groups="expandedPrices"
        v-model:editing-rows="editingPrices"
        :value="prices"
        data-key="id"
        sort-field="startDate"
        :sortOrder="-1"
        :scrollable="true"
        scroll-height="flex"
        lazy
        :loading="pricesLoading"
        :expandable-row-groups="true"
        row-group-mode="subheader"
        group-rows-by="year"
        edit-mode="row"
        @row-edit-save="onRowEditSave"
      )

        template(#groupheader='slotProps')
          div.inline-flex.vertical-align-middle.font-bold.line-height-3
            p {{ slotProps.data.year }}

        Column(field="startDate" :sortable="true" header="Start Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.startDate) }}
        Column(field="endDate" header="End Date")
          template(#body="slotProps")
            p {{ localizedShortDateTime(slotProps.data.endDate) }}
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
