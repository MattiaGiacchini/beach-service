<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/report'
import { VoucherStatus, VoucherStatuses } from '@/types/VoucherStatus'
import Select from 'primevue/select'
import { useTimeUtils } from '@/composables/timeUtils'
import { onMounted, ref } from 'vue'
import { useCurrencyUtils } from '@/composables/currencyUtils'

const props = withDefaults(
  defineProps<{
    review?: boolean
  }>(),
  {
    review: false
  }
)

const reportStore = useReportStore()

const { reportLoading, report, totalRevenue } = storeToRefs(reportStore)

const { localizedShortDateTime } = useTimeUtils()
const { formatCurrency } = useCurrencyUtils()

function refresh() {
  reportStore.fillReport()
}

defineEmits(['approveVoucher', 'rejectVoucher'])
</script>

<template lang="pug">
div.list-container
  Card.spinner-card(v-if="false" )
    template(#content)
      div.spinner-wrapper
        ProgressSpinner()

  Card()
    template(#title)
      div.table-commands
        p {{ review ? "Review" : "Report" }}
        div.commands-buttons(v-if="!review")
          Button(icon="pi pi-sync" severity="secondary" rounded variant="outlined" @click="refresh")
          Button(icon="pi pi-download" severity="secondary" rounded variant="outlined" @click="refresh")

    template(#content).list
      DataTable(
        :value="report"
        :lazy="true"
        scrollable
        :loading="reportLoading"
        size="normal"
        scroll-height="flex"
        striped-rows
      )
        ColumnGroup(type="header")
          Row
            Column(header="Id").center-text
            Column(header="Customer Name").center-text
            Column(header="Check In").center-text
            Column(header="Check Out").center-text
            Column(header="Umbrellas").center-text
            Column(header="Beds").center-text
            Column(header="Days").calculation-column.center-text
            Column(header="Price").calculation-column.center-text
            Column(header="U. Var.").calculation-column.center-text
            Column(header="B. Var.").calculation-column.center-text
            Column(header="Partial Price").calculation-result-column.center-text
            Column(header="Total Price").calculation-result-column.center-text
            Column(header="Review" v-if="review").center-text
            Column(header="Status" v-else).center-text


        Column(field="bsNumber" dataType="numeric").center-text
        Column(field="customerName")
        Column(field="checkIn").center-text
          template(#body="slotProps") {{localizedShortDateTime(slotProps.data.checkIn)}}

        Column(field="checkOut").center-text
          template(#body="slotProps") {{localizedShortDateTime(slotProps.data.checkOut)}}

        Column(field="umbrellas" dataType="numeric").center-text
        Column(field="beds" dataType="numeric").center-text
        Column(:colspan="5")
          template(#body="slotProps")
            div.price-details-wrapper
              div.price-detail-row(v-for="(detail, index) in slotProps.data.priceDetails" :key="index")
                div.center-text.calculation-column {{ detail.days }}
                div.right-text.calculation-column {{ formatCurrency(detail.price) }}
                div.center-text.calculation-column
                  p(v-if="detail.umbrellasVariation > 1") {{ `x${detail.umbrellasVariation}` }}
                div.center-text.calculation-column
                  p(v-if="detail.bedsVariation") {{ detail.bedsVariation }}
                div.right-text.calculation-result-column {{ formatCurrency(detail.pricePerPeriod) }}

        Column(field="totalVoucherValue" dataType="numeric").right-text.calculation-result-column
          template(#body="slotProps") {{ formatCurrency(slotProps.data.totalVoucherValue) }}

        Column(v-if="review").center-text
          template(#body="slotProps")
            div.review-buttons
              Button(icon="pi pi-check" severity="success" rounded variant="outlined"
                @click="$emit('approveVoucher', slotProps.data.id)")
              Button(icon="pi pi-times" severity="danger" rounded variant="outlined"
                @click="$emit('rejectVoucher', slotProps.data.id)")

        Column(field="voucherStatus" v-else).center-text
          template(#body="slotProps")
            Tag(:value="VoucherStatus[slotProps.data.voucherStatus].text.toUpperCase()"
              :severity="VoucherStatus[slotProps.data.voucherStatus].color")

          template(#editor="{ data, field }")
            Select(v-model="data.voucherStatus" editable :options="VoucherStatuses" optionLabel="text"
              placeholder="Status")

        ColumnGroup(type="footer" :frozen="true")
          Row(:frozen="true")
            Column(footer="Totals:" :colspan="11" ).right-text
            Column(:footer="formatCurrency(totalRevenue)").right-text
            Column(footer="")

</template>

<style lang="scss">
.table-commands {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.commands-buttons,
.review-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
.list-container {
  flex: 1;
  max-height: 100%;

  div.p-card.p-component,
  div.p-card-body {
    height: 100%;

    div.p-card-content {
      height: calc(100% - 33.59px);
    }
  }
}

.nested-table {
  & tr {
    background: transparent !important;
  }
  & tr:last-child td {
    border-bottom: none;
  }
}

td:has(div.nested-table) {
  padding: 0 !important;
}

td.right-text,
.right-text {
  text-align: end !important;
}

td.center-text,
.center-text {
  text-align: center !important;
}

td.left-text,
.left-text {
  text-align: start !important;
}

th.center-text .p-datatable-column-header-content {
  text-align: center;
  justify-content: center;
}

.calculation-column {
  min-width: calc(85px + 0.75rem) !important;
  width: calc(85px + 0.75rem) !important;
  max-width: calc(85px + 0.75rem) !important;
}

.calculation-result-column {
  min-width: calc(120px + 0.75rem) !important;
  width: calc(120px + 0.75rem) !important;
  max-width: calc(120px + 0.75rem) !important;
}

.spinner-card {
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

.price-details-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.price-detail-row {
  display: grid;
  grid-template-columns:
    calc(85px + 0.75rem) calc(85px + 0.75rem) calc(85px + 0.75rem) calc(85px + 0.75rem)
    calc(120px + 0.75rem);
  align-items: center;
  & > div {
    padding: var(--p-datatable-body-cell-padding);
  }
}

.price-detail-row:not(:last-child) {
  border-bottom: 1px solid var(--p-datatable-body-cell-border-color);
}

td:has(.price-details-wrapper) {
  padding: 0 !important;
}

/* === Print Styles Only === */
@page {
  size: A4 portrait;
  margin: 5mm;
}

@media print {
  body * {
    visibility: hidden !important;
  }

  .p-card-body {
    padding: 0 !important;
  }

  .p-button,
  div.p-card-title,
  div.p-card-header *,
  div.p-card-footer * {
    display: none !important;
  }

  .list-container,
  .list-container * {
    visibility: visible !important;
  }

  .list-container .p-card {
    border: none !important;
    box-shadow: none !important;
  }
  .list-container .p-card .p-card-content,
  .list-container .p-card .p-card-body {
    border: none !important;
    box-shadow: none !important;
  }

  .list-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    table-layout: fixed; // Para que respeten los widths
  }

  table {
    width: 100% !important;
    table-layout: fixed !important;
    font-size: 7px !important;
    border-collapse: collapse !important;
    page-break-inside: avoid !important;
  }

  tr,
  .price-detail-row {
    page-break-inside: avoid !important;
  }

  th,
  td {
    padding: 1px 2px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    border-bottom: 1px solid var(--p-datatable-body-cell-border-color);
    border-left: none !important;
    border-right: none !important;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 4% !important;
  } /* Id */
  th:nth-child(2),
  td:nth-child(2) {
    width: 18% !important;
  } /* Customer Name */
  th:nth-child(3),
  td:nth-child(3),
  th:nth-child(4),
  td:nth-child(4) {
    width: 8% !important;
  } /* Check In / Out */
  th:nth-child(5),
  td:nth-child(5),
  th:nth-child(6),
  td:nth-child(6) {
    width: 6% !important;
  } /* Umbrellas / Beds */
  th:nth-child(7),
  td:nth-child(7) {
    width: 5% !important;
  } /* Days */
  th:nth-child(8),
  td:nth-child(8) {
    width: 7% !important;
  } /* Price */
  th:nth-child(9),
  td:nth-child(9),
  th:nth-child(10),
  td:nth-child(10) {
    width: 5% !important;
  } /* U.Var / B.Var */
  th:nth-child(11),
  td:nth-child(11) {
    width: 10% !important;
  } /* Partial Price */
  th:nth-child(12),
  td:nth-child(12) {
    width: 10% !important;
  } /* Total Price */

  th:last-child,
  td:last-child {
    display: none !important;
  }
  thead th,
  tfoot td {
    font-weight: bold !important;
  }

  .list-container table tbody tr {
    background: transparent !important;
  }
  .list-container table tbody tr:nth-child(even) {
    background: var(--p-surface-50) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .price-detail-row > div.calculation-column,
  .price-detail-row > div.calculation-result-column {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .price-detail-row > div {
    min-width: 20% !important;
    width: 20% !important;
    max-width: 20% !important;
  }

  .price-detail-row {
    grid-template-columns: 20% 20% 20% 20% 20% !important;
  }
}
</style>
