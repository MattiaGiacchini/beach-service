<script setup lang="ts">
import Chart from 'primevue/chart'
import { ChartOptions } from '@/types/Chart'

const props = withDefaults(
  defineProps<{
    title: string
    data: any
    options?: any
    type?: string
  }>(),
  {
    type: 'bar',
    options: ChartOptions
  }
)
</script>

<template lang="pug">
Card.chart-layout__card
  template(#title) {{ title }}
  template(#content)
    Chart(:type="type" :data="data" :options="options")
</template>
