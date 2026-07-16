<script lang="ts">
export function buildStatusSummaryLabel(selected: string[]): string {
  return `${selected.length} statuses selected`
}
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import { useReportStore } from '@/stores/report'
import { VoucherStatus } from '@/types/VoucherStatus'

const emit = defineEmits<{ (e: 'search', query: string): void }>()

const reportStore = useReportStore()

const allStatusOptions = Object.entries(VoucherStatus).map(([key, value]) => ({
  key,
  text: value.text
}))

const selectedStatusText = ref<string>('')
const filteredStatuses = ref(allStatusOptions)
const selectedYear = ref<number>(new Date().getFullYear())
const searchQuery = ref<string>('')

function searchStatuses(event: { query: string }) {
  const q = event.query.toLowerCase()
  filteredStatuses.value = allStatusOptions.filter(s => s.text.toLowerCase().startsWith(q))
}

function onStatusSelect(event: { value: { key: string; text: string } }) {
  reportStore.statusFilter = [event.value.key]
  reportStore.fillReport()
}

function onStatusClear() {
  reportStore.statusFilter = []
  reportStore.fillReport()
}

function onYearChange(newYear: number | null) {
  if (!newYear) return
  selectedYear.value = newYear
  reportStore.startDateFilter = `${newYear}-01-01`
  reportStore.endDateFilter = `${newYear}-12-31`
  reportStore.fillReport()
}
</script>

<template lang="pug">
div.filter-bar
  div.filter-field--status
    FloatLabel(variant="in")
      AutoComplete(
        id="statusFilter"
        v-model="selectedStatusText"
        :suggestions="filteredStatuses"
        option-label="text"
        :fluid="true"
        @complete="searchStatuses"
        @option-select="onStatusSelect"
        @clear="onStatusClear"
      )
      label(for="statusFilter") Status

  div.filter-field--year
    FloatLabel(variant="in")
      InputNumber(
        id="yearSelect"
        v-model="selectedYear"
        :fluid="true"
        :use-grouping="false"
        :min="2018"
        :max="new Date().getFullYear()"
        :disabled="reportStore.reportLoading"
        @update:model-value="onYearChange"
      )
      label(for="yearSelect") Year

  div.filter-field--search
    FloatLabel(variant="in")
      InputText(
        id="searchBar"
        v-model="searchQuery"
        :fluid="true"
        @update:model-value="emit('search', $event)"
      )
      label(for="searchBar") Search

  div.filter-actions
    Button(icon="pi pi-sync" severity="secondary" rounded variant="outlined" :loading="reportStore.reportLoading" @click="reportStore.fillReport()")
    Button(icon="pi pi-print" severity="secondary" rounded variant="outlined" @click="() => window.print()")
</template>

<style lang="scss">
.filter-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  font-size: 1rem;
  font-weight: normal;
  flex: 1;
}

.filter-field--status { width: 190px; }
.filter-field--year   { width: 120px; }
.filter-field--search { width: 100%; max-width: 250px; }

.filter-field--status,
.filter-field--year,
.filter-field--search {
  .p-floatlabel { width: 100%; }
}

.filter-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
</style>