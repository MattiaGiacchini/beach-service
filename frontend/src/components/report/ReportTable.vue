<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/report'
import { VoucherStatus, VoucherStatuses } from '@/types/VoucherStatus'
import Select from 'primevue/select'
import { useTimeUtils } from '@/composables/timeUtils'

const reportStore = useReportStore()
const { reportLoading, report, totalRevenue } = storeToRefs(reportStore)

const formatCurrency = (value) => {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}
</script>

<template lang="pug">
div.list-container
  Card
    template(#title) Report
    template(#content).list
      DataTable(
        :value="report"
        rowGroupMode="rowspan"
        :loading="reportLoading"
        :lazy="true"
        scrollable
        size="normal"
        scroll-height="flex"
        striped-rows
        editMode="cell"
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
            Column(header="Status").center-text


        Column(field="bsNumber" dataType="numeric").center-text
        Column(field="customerName")
        Column(field="checkIn").center-text
          template(#body="slotProps") {{useTimeUtils().localizedShortDateTime(slotProps.data.checkIn)}}

        Column(field="checkOut").center-text
          template(#body="slotProps") {{useTimeUtils().localizedShortDateTime(slotProps.data.checkOut)}}

        Column(field="umbrellas" dataType="numeric").center-text
        Column(field="beds" dataType="numeric").center-text
        Column(:colspan="5")
          template(#body="slotProps")
            DataTable.nested-table(
              :stripedRows="false"
              :value="slotProps.data.priceDetails"
              :showHeaders="false"
            )
              Column(field="days").center-text.calculation-column
              Column(field="price" dataType="numeric").right-text.calculation-column
                template(#body="slotProps") {{ formatCurrency(slotProps.data.price) }}

              Column(field="umbrellasVariation" dataType="numeric").center-text.calculation-column
                template(#body="slotProps")
                  p(v-if="slotProps.data.umbrellasVariation > 1") {{ `x${slotProps.data.umbrellasVariation}` }}
              Column(field="bedsVariation" dataType="numeric").center-text.calculation-column
                template(#body="slotProps")
                  p(v-if="slotProps.data.bedsVariation") {{slotProps.data.bedsVariation}}

              Column(field="pricePerPeriod" dataType="numeric").right-text.calculation-result-column
                template(#body="slotProps") {{ formatCurrency(slotProps.data.pricePerPeriod) }}


        Column(field="totalVoucherValue" dataType="numeric").right-text.calculation-result-column
          template(#body="slotProps") {{ formatCurrency(slotProps.data.totalVoucherValue) }}
        Column(field="voucherStatus").center-text
          template(#body="slotProps")
            Tag(:value="VoucherStatus[slotProps.data.voucherStatus].text.toUpperCase()"
              :severity="VoucherStatus[slotProps.data.voucherStatus].color")

          template(#editor="{ data, field }")
            Select(v-model="data.voucherStatus" editable :options="VoucherStatuses" optionLabel="text"
              placeholder="Status")

        ColumnGroup(type="footer" :frozen="true")
          Row(:frozen="true")
            Column(footer="Totals:" :colspan="11" footerStyle="text-align:right")
            Column(:footer="formatCurrency(totalRevenue)").right-text
            Column(footer="")

</template>

<style lang="scss">
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

td.right-text {
  text-align: end !important;
}

td.center-text {
  text-align: center !important;
}

td.left-text {
  text-align: start !important;
}

th.center-text .p-datatable-column-header-content {
  text-align: center;
  justify-content: center;
}

.calculation-column {
  min-width: 85px !important;
  width: 85px !important;
  max-width: 85px !important;
}

.calculation-result-column {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
}
</style>
