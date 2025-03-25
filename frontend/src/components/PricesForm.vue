<script setup lang="ts">
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import FloatLabel from 'primevue/floatlabel'
import DatePicker from 'primevue/datepicker'

const pricesStore = usePricesStore()
const { price, name, dates, pricesLoading } = storeToRefs(pricesStore)

function disableButton() {
  const validDates = dates.value?.every((date: Date) => date !== null)
  return !(validDates && price.value)
}
</script>

<template lang="pug">
Card
  template(#title) New price
  template(#content)
    form.form-container
      div(v-focustrap).form-row
        FloatLabel(variant="in")
          label(for="name" ) Name
          InputText(id="name" v-model="name" :fluid="true")
        FloatLabel(variant="in")
          InputNumber(v-model='price' id="price" :step='0.5' :min='0' mode='currency' currency='EUR' autofocus
          :fluid="true")
          label(for="price") Price

      DatePicker(v-model='dates' selection-mode='range' :manualinput='false' :number-of-months="2" :inline="true"
        :show-other-months="true" :select-other-months="true")

      div.actions
        Button(label="Submit" @click="pricesStore.addPrice()" :loading="pricesLoading" :disabled="disableButton()")
</template>

<style lang="scss">
div.p-card.p-component {
  height: fit-content;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
