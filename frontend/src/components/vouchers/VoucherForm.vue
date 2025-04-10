<script setup lang="ts">
import { usePricesStore } from '@/stores/prices'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'
import { onMounted } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'

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

onMounted(() => {
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
          FloatLabel(variant="in")
            InputNumber(id="bsNumber" v-model="bsNumber" :fluid="true" :min="0")
            label(for="bsNumber" ) BS Number

          ToggleButton.friendly-button(v-model="friendly" onLabel="A" offLabel="BS" size="large" :tabindex="-1")

          FloatLabel(variant="in")
            InputNumber(id="room" v-model="room" :fluid="true" :tabindex="-1" )
            label(for="room" ) Room

        div.form-row
          FloatLabel(variant="in")
            InputText(id="name" v-model="name" :fluid="true" :autofocus="true")
            label(for="name" ) Name

        div.form-row
          FloatLabel(variant="in")
            InputNumber(id="umbrellas" v-model="umbrellas" :fluid="true" :min="0" :step="1")
            label(for="umbrellas" ) Umbrellas

          FloatLabel(variant="in")
            InputNumber(id="beds" v-model="beds" :fluid="true" :min="0" :step="1")
            label(for="beds" ) Beds


      DatePicker(v-model='dates' selection-mode='range' :manualinput='false' :number-of-months="2" :inline="true"
        :show-other-months="true" :select-other-months="true")

      div.actions
        Button(label="Submit" @click="voucherStore.addVoucher()" :loading="voucherLoading" :disabled="disableButton()")
</template>

<style lang="scss">
div.p-card.p-component {
  height: fit-content;
}

.friendly-button {
  width: 50%;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
