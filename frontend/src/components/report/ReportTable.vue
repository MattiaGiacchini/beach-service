<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/report'
import { VoucherStatus, VoucherStatuses } from '@/types/VoucherStatus'
import Select from 'primevue/select'

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
        scrollable
        scroll-height="flex"
        striped-rows
        editMode="cell"
      )
        ColumnGroup(type="header")
          Row
            Column(header="Id")
            Column(header="Customer Name")
            Column(header="Check In")
            Column(header="Check Out")
            Column(header="Umbrellas")
            Column(header="Beds")
            Column(header="Days")
            Column(header="Price")
            Column(header="UV")
            Column(header="BV")
            Column(header="Partial Price")
            Column(header="Total Price")
            Column(header="Status")


        Column(field="bsNumber" dataType="numeric")
        Column(field="customerName")
        Column(field="checkIn")
        Column(field="checkOut")
        Column(field="umbrellas" dataType="numeric")
        Column(field="beds" dataType="numeric")
        Column(:colspan="5")
          template(#body="slotProps")
            DataTable.nested-table(:stripedRows="false" :value="slotProps.data.priceDetails"
              :showHeaders="false")
              Column(field="days")
              Column(field="price" dataType="numeric").numeric
                template(#body="slotProps") {{ formatCurrency(slotProps.data.price) }}

              Column(field="umbrellasVariation" dataType="numeric")
                template(#body="slotProps")
                  p(v-if="slotProps.data.umbrellasVariation > 1") {{slotProps.data.umbrellasVariation}}
              Column(field="bedsVariation" dataType="numeric")
                template(#body="slotProps")
                  p(v-if="slotProps.data.bedsVariation") {{slotProps.data.bedsVariation}}

              Column(field="pricePerPeriod" dataType="numeric").numeric
                template(#body="slotProps") {{ formatCurrency(slotProps.data.pricePerPeriod) }}


        Column(field="totalVoucherValue" dataType="numeric").numeric
          template(#body="slotProps") {{ formatCurrency(slotProps.data.totalVoucherValue) }}
        Column(field="voucherStatus")
          template(#body="slotProps")
            Tag(:value="VoucherStatus[slotProps.data.voucherStatus].text.toUpperCase()"
              :severity="VoucherStatus[slotProps.data.voucherStatus].color")

          template(#editor="{ data, field }")
            Select(v-model="data.voucherStatus" editable :options="VoucherStatuses" optionLabel="text"
              placeholder="Status")



//
        //Column(field="bsNumber" header="Id")
        //Column(field="customerName" header="Customer Name")
        //Column(field="checkIn" header="Check In")
        //Column(field="checkOut" header="Check Out")
        //Column(field="umbrellas" header="Umbrellas")
        //Column(field="beds" header="Beds")
        //Column(field="days" header="Days")
        //  template(#body="slotProps")
        //      div(v-for="(item, index) in slotProps.data.priceDetails" :key="index")
        //        span {{ item.days }}
        //        Divider(v-if="index < slotProps.data.priceDetails.length - 1")
        //
        //Column(field="price" header="Price")
        //  template(#body="slotProps")
        //    div(v-for="(item, index) in slotProps.data.priceDetails" :key="index")
        //      span {{ item.price }}
        //      Divider(v-if="index < slotProps.data.priceDetails.length - 1")
        //
        //Column(field="umbrellasVariation" header="UV")
        //  template(#body="slotProps")
        //    div(v-for="(item, index) in slotProps.data.priceDetails" :key="index")
        //      span(v-show="item.umbrellasVariation !== 1") {{ item.umbrellasVariation }}
        //      Divider(v-if="index < slotProps.data.priceDetails.length - 1")
        //
        //Column(field="bedsVariation" header="BV")
        //
        //  template(#body="slotProps")
        //    div(v-for="(item, index) in slotProps.data.priceDetails" :key="index")
        //      span(v-show="item.bedsVariation") {{ item.bedsVariation }}
        //      Divider(v-if="index < slotProps.data.priceDetails.length - 1")
        //
        //Column( header="Partial Price")
        //  template(#body="slotProps")
        //    div(v-for="(item, index) in slotProps.data.priceDetails" :key="index")
        //      span {{ item.pricePerPeriod }}
        //      Divider(v-if="index < slotProps.data.priceDetails.length - 1")
        //
        //
        //
        //Column(field="totalVoucherValue" header="Price")

        ColumnGroup(type="footer" :frozen="true")
          Row(:frozen="true")
            Column(footer="Totals:" :colspan="11" footerStyle="text-align:right")
            Column(:footer="formatCurrency(totalRevenue)").numeric
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

td.numeric {
  text-align: end !important;
}
</style>
