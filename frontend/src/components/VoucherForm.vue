<script setup lang="ts">
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'
import { onMounted } from 'vue'

const voucherStore = useVoucherStore()
const {
  beds,
  bsNumber,
  dates,
  friendly,
  name,
  room,
  umbrellas,
  voucherLoading,
  vouchers,
  lastVouchers
} = storeToRefs(voucherStore)

function disableButton() {
  const validDates = dates.value?.every((date: Date) => date !== null)
  return !(validDates && price.value)
}

onMounted(()=> {

voucherStore.fillLastVouchers()
voucherStore.fillVouchers()
console.log(vouchers)
console.log(lastVouchers)
})

</script>

<template lang="pug">
Card
  template(#title) Voucher
  template(#content)
    form.form-container
      div.form-col(v-focustrap)
        div.form-row
          div.form-input.input-50
            label(for="bsNumber") BS Number
            InputNumber(v-model='bsNumber' input-id="bsNumber" :step='1' :min='0')
          div.form-input.input-25
            label(for="friendly") Friendly
            ToggleButton(v-model="friendly" onLabel="A" offLabel="A" input-id="friendly" :tabindex="-1")
          div.form-input.input-25
            label(for="room") Room
            InputNumber(v-model='room' input-id="room" :step='1' :min='0'  :tabindex="-1" prefix="#" )

        div.form-row
          div.form-input
            label(for="name") Name
            InputText(id="name" v-model="name" autofocus)

        div.form-row
          div.form-input
            label(for="umbrellas") Umbrellas
            InputNumber(v-model='umbrellas' input-id="umbrellas" :step='1' :min='0')
          div.form-input
            label(for="beds") Beds
            InputNumber(v-model='beds' input-id="beds" :step='1' :min='0')

      Calendar(v-model='dates' selection-mode='range' :manualinput='false' :number-of-months="2" :inline="true" :show-other-months="true" :select-other-months="true")

      div.actions
        Button(label="Submit" @click="voucherStore.addVoucher()" :loading="voucherLoading" :disabled="disableButton()")
</template>

<style lang="scss">
div.p-card.p-component {
  height: fit-content;
}

.form-container, .form-col {
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