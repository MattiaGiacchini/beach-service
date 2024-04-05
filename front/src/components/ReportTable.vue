<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import { type Ref, ref, onMounted } from 'vue'

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
      console.log(beachServices.value)
    })
})
</script>

<template>
  <div class="w-screen">
    <DataTable
      :value="beachServices"
      stripedRows
      rowGroupMode="rowspan"
      :groupRowsBy="['id', 'name', 'totalPrice']"
    >
      <Column field="id" header="Id"></Column>
      <Column field="name" header="Name"></Column>
      <Column field="period.days" header="Days"></Column>
      <Column field="period.price" header="Price"></Column>
      <Column field="period.periodTotalPrice" header="Partial Price"></Column>

      <Column field="totalPrice" header="Price"></Column>
    </DataTable>
  </div>
</template>
