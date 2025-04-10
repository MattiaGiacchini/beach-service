<script setup lang="ts">
import PricesForm from '@/components/prices/PricesForm.vue'
import PricesList from '@/components/prices/PricesList.vue'
import { usePricesStore } from '@/stores/prices'

usePricesStore().fillPrices()
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
  height: 100%;
}
</style>
