<script setup lang="ts">

import { onMounted, ref, type Ref } from 'vue'
import type { BeachService } from '@/types/BeachService'

const beachServices: Ref<object[]> = ref([])

function explodePeriods(reservation: BeachService) {
  return reservation.periods.map((period) => ({
    ...reservation,
    period
  }))
}

onMounted(() => {
  fetch('http://localhost:3000/api/beachservice')
    .then((response) => response.json())
    .then((data) => (beachServices.value = data.reservations))
    .then(() => {
      beachServices.value = beachServices.value.flatMap(explodePeriods)
    })
})
</script>

<template lang="pug">
div.w-screen
  Card
    template()
    template()
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
