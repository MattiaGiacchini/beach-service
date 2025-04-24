<script setup lang="ts">
import { onMounted } from 'vue'
import { useChartStore } from '@/stores/chart'
import Chart from 'primevue/chart'
import { storeToRefs } from 'pinia'
import { ChartOptions } from '@/types/Chart'
import ChartCard from '@/components/chart/ChartCard.vue'

const chartStore = useChartStore()
const {
  chartLoading,
  monthlyRevenueData,
  friendlyMonthlyRevenue,
  nonFriendlyMonthlyRevenue,
  yearlyRevenue,
  yearlyVoucherAmount,
  yearlyPeopleAmount
} = storeToRefs(chartStore)

onMounted(async () => {
  await useChartStore().fillMonthlyRevenue()
  await useChartStore().fillYearlyStats()
})
</script>

<template lang="pug">
main.chart-layout
  Card.chart-layout__spinner-card(v-if="chartLoading")
    template(#content)
      div.spinner-wrapper
        ProgressSpinner()

  div.chart-layout__section.chart-layout__section--small(v-if="!chartLoading")
    ChartCard(title="Voucher Yearly Revenue" :data="yearlyRevenue")
    ChartCard(title="Voucher Amount" :data="yearlyVoucherAmount")
    ChartCard(title="Customers Amount" :data="yearlyPeopleAmount")

  div.chart-layout__section.chart-layout__section--large(v-if="!chartLoading")
    ChartCard(title="BS Voucher Monthly Revenue" :data="nonFriendlyMonthlyRevenue")
    ChartCard(title="A Voucher Monthly Revenue" :data="friendlyMonthlyRevenue")
</template>

<style lang="scss">
$gap: 16px;

.chart-layout {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $gap;
  height: 100%;

  &__spinner-card {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 100%;
  }

  .spinner-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__section {
    display: flex;
    gap: $gap;
    flex: 1;

    &--small {
      flex: 0 0 40%;
    }

    &--large {
      flex: 0 0 60%;
    }
  }

  &__card {
    flex: 1;
    display: flex;
    flex-direction: column;

    canvas {
      flex: 1;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
