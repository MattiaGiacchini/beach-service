<script setup lang="ts">
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'

const pricesStore = usePricesStore()
const { price, name, dates } = storeToRefs(pricesStore)

function disableButton() {
  const validDates = dates.value?.every((date: Date) => date !== null)
  return !(validDates && price.value)
}

</script>

<template lang="pug">
Card
  template(#title) Prices
  template(#content)
    form.form-container
      div.form-row(v-focustrap)
        div.form-input
          label(for="name") Name
          InputText(id="name" v-model="name")
        div.form-input
          label(for="price") Price
          InputNumber(v-model='price' input-id="price" :step='0.5' :min='0' mode='currency' currency='EUR')

      Calendar(v-model='dates' selection-mode='range' :manualinput='false' :number-of-months="2" :inline="true" :show-other-months="true" :select-other-months="true")

      div.actions
        Button(label="Submit" @click="pricesStore.addPrice()" :loading="pricesLoading" :disabled="disableButton()")
</template>

<style lang="scss">
div.p-card.p-component {
  height: fit-content;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 2;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 16px
}

.actions {
  display: flex;
  justify-content: flex-end;
}

</style>