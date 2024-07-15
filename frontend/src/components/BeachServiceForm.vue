<script lang="ts" setup>
import { ref, type Ref } from 'vue'

const bsNum: Ref<number> = ref(undefined)
const name: Ref<string> = ref('')
const room: Ref<number | undefined> = ref(undefined)
const hidden: Ref<boolean> = ref(false)
const checkIn: Ref<string> = ref('')
const checkOut: Ref<string> = ref('')
const umbrellas: Ref<number> = ref(1)
const beds: Ref<number> = ref(2)
</script>

<template lang="pug">
div.w-screen
  DataTable(
    :value="beachServices"
    stripedRows
    rowGroupMode="rowspan"
    :groupRowsBy="['id', 'name', 'totalPrice']"
  )
    Column(field="id" header="Id")
    Column(field="name" header="Name")
    Column(field="period.days" header="Days")
    Column(field="period.price" header="Price")
    Column(field="period.periodTotalPrice" header="Partial Price")
    Column(field="totalPrice" header="Price")
</template>
