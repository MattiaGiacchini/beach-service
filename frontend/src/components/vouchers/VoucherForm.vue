<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'
import { nextTick, onMounted, ref, computed } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import type { VoucherFormInitialValues } from '@/types/Voucher'
import { useTimeUtils } from '@/composables/timeUtils'

const props = withDefaults(defineProps<{
  initialValues?: VoucherFormInitialValues | null
  friendlyDisabled?: boolean
}>(), {
  initialValues: null,
  friendlyDisabled: false,
})

const { formatDateToYMD } = useTimeUtils()

const emit = defineEmits<{ (e: 'submit', payload: VoucherFormInitialValues): void }>()

const voucherStore = useVoucherStore()
const {
  beds: storeBeds,
  bsNumber: storeBsNumber,
  dates: storeDates,
  friendly: storeFriendly,
  customerName: storeCustomerName,
  roomNumber: storeRoomNumber,
  umbrellas: storeUmbrellas,
  voucherLoading,
  lastVoucherNumber,
  vouchers,
  lastVouchers,
  oldCustomersNames
} = storeToRefs(voucherStore)

// --- Edit mode: local refs (isolated from the shared store) ---
// Initialize immediately from props so the submit button is enabled on first render
const localBsNumber = ref<number | null>(props.initialValues?.bsNumber ?? null)
const localCustomerName = ref(props.initialValues?.customerName ?? '')
const localUmbrellas = ref(props.initialValues?.umbrellas ?? 0)
const localBeds = ref(props.initialValues?.beds ?? 0)
const localRoomNumber = ref<number | undefined>(props.initialValues?.roomNumber ?? undefined)
const localFriendly = ref(props.initialValues?.friendly ?? false)
const localDates = ref<Date[]>(
  props.initialValues
    ? [new Date(props.initialValues.checkIn), new Date(props.initialValues.checkOut)]
    : []
)

// Computed proxies — point to local refs in edit mode, store refs in create mode
const bsNumber = computed({
  get: () => props.initialValues ? localBsNumber.value : storeBsNumber.value,
  set: (v) => { props.initialValues ? (localBsNumber.value = v) : (storeBsNumber.value = v) }
})
const customerName = computed({
  get: () => props.initialValues ? localCustomerName.value : storeCustomerName.value,
  set: (v) => { props.initialValues ? (localCustomerName.value = v) : (storeCustomerName.value = v) }
})
const umbrellas = computed({
  get: () => props.initialValues ? localUmbrellas.value : storeUmbrellas.value,
  set: (v) => { props.initialValues ? (localUmbrellas.value = v) : (storeUmbrellas.value = v) }
})
const beds = computed({
  get: () => props.initialValues ? localBeds.value : storeBeds.value,
  set: (v) => { props.initialValues ? (localBeds.value = v) : (storeBeds.value = v) }
})
const roomNumber = computed({
  get: () => props.initialValues ? localRoomNumber.value : storeRoomNumber.value,
  set: (v) => { props.initialValues ? (localRoomNumber.value = v) : (storeRoomNumber.value = v) }
})
const friendly = computed({
  get: () => props.initialValues ? localFriendly.value : storeFriendly.value,
  set: (v) => { props.initialValues ? (localFriendly.value = v) : (storeFriendly.value = v) }
})
const dates = computed({
  get: () => props.initialValues ? localDates.value : storeDates.value,
  set: (v) => { props.initialValues ? (localDates.value = v) : (storeDates.value = v) }
})

function disableButton() {
  const validDates = dates.value?.length >= 2 && dates.value.every((date: Date) => date instanceof Date && !isNaN(date.getTime()))
  return !(validDates && customerName.value && bsNumber.value)
}

onMounted(async () => {
  if (props.initialValues) {
    // Edit mode: local refs already initialized from props at declaration time.
    // Nothing to do here.
  } else {
    // Create mode: existing behaviour
    await voucherStore.fillLastVoucherNumber()
    await voucherStore.fillLastVouchers()
  }
})

const filteredCustomers = ref([])

function searchCustomers(event) {
  const query = event.query.toLowerCase()
  filteredCustomers.value = (oldCustomersNames.value ?? []).filter((customer) =>
    customer.toLowerCase().startsWith(query)
  )
}

const autoCompleteRef = ref()

const closePanel = () => {
  nextTick(() => {
    setTimeout(() => {
      autoCompleteRef.value?.hide()
    }, 150)
  })
}

const onSubmit = () => {
  if (props.initialValues) {
    // Edit mode: emit data to parent
    emit('submit', {
      bsNumber:     localBsNumber.value!,
      roomNumber:   localRoomNumber.value,
      customerName: localCustomerName.value,
      umbrellas:    localUmbrellas.value,
      beds:         localBeds.value,
      checkIn:      formatDateToYMD(localDates.value[0]),
      checkOut:     formatDateToYMD(localDates.value[1]),
      friendly:     localFriendly.value,
    })
  } else {
    voucherStore.addVoucher()

    nextTick(() => {
      autoCompleteRef.value?.$el.querySelector('input')?.focus()
    })
  }
}
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

          ToggleButton.friendly-button(v-model="friendly" onLabel="A" offLabel="BS" size="large" :tabindex="-1" :disabled="friendlyDisabled")

          FloatLabel(variant="in")
            InputNumber(id="roomNumber" v-model="roomNumber" :fluid="true" :tabindex="-1" )
            label(for="roomNumber" ) Room

        div.form-row
          FloatLabel(variant="in")
            AutoComplete(
              ref="autoCompleteRef"
              v-model="customerName"
              :suggestions="filteredCustomers"
              autofocus
              :forceSelection="false"
              id="customerName"
              @complete="searchCustomers"
              @blur="closePanel"
            ).large-field

            label(for="customerName" ) Customer Name

        div.form-row
          FloatLabel(variant="in")
            InputNumber(id="umbrellas" v-model="umbrellas" :fluid="true" :min="0" :step="1")
            label(for="umbrellas" ) Umbrellas

          FloatLabel(variant="in")
            InputNumber(id="beds" v-model="beds" :fluid="true" :min="0" :step="1")
            label(for="beds" ) Beds


      DatePicker(
        v-model='dates'
        selection-mode="range"
        :manual-input='false'
        :number-of-months="2"
        :inline="true"
        :show-other-months="true"
        :select-other-months="true"
        )

      div.actions
        Button(label="Submit" @click="onSubmit" :loading="voucherLoading" :disabled="disableButton()")
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

.large-field {
  width: 100%;

  & input {
    width: 100%;
  }
}
</style>