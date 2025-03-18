<script setup lang="ts">
import PricesForm from '@/components/PricesForm.vue'
import { usePricesStore } from '@/stores/prices'
import PricesList from '@/components/PricesList.vue'
import api from '@/api/axios'

usePricesStore().fillPrices()

console.log('Base URL meta:', import.meta.env.VITE_BACKEND_BASE_URL)

api.get('/prices').then((response) => console.log('SUPABASE', response.data))
</script>

<template lang="pug">
main.prices-layout
  PricesForm
  PricesList
</template>

<style lang="scss">
.prices-layout {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 59.4px);
}
</style>
