<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import { type Ref, ref, onMounted } from 'vue'

const beachServices: Ref<object[]> = ref([])

onMounted(() => {
  fetch('http://localhost:3000/api/beachservice')
    .then((response) => response.json())
    .then((data) => (beachServices.value = data.reservations))
})
</script>

<template>
  <div class="w-screen">
    <DataTable :value="beachServices" stripedRows tableStyle="min-width: 50rem">
      <Column field="id" header="Id"></Column>
      <Column field="name" header="Name"></Column>
      <Column field="days" header="Days"></Column>
      <Column field="total_price" header="Price"></Column>
    </DataTable>
  </div>
</template>
