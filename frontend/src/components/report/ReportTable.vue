<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useReportStore } from '@/stores/report'
import { useVoucherStore } from '@/stores/voucher'
import { VoucherStatus, VoucherStatuses } from '@/types/VoucherStatus'
import Select from 'primevue/select'
import { useTimeUtils } from '@/composables/timeUtils'
import { type Ref, ref, computed } from 'vue'
import { useCurrencyUtils } from '@/composables/currencyUtils'
import FloatLabel from 'primevue/floatlabel'
import ContextMenu from 'primevue/contextmenu'
import { deleteVoucher, updateVoucher, createVoucher } from '@/service/VoucherService'
import { deleteVoucherFromReport, replaceVoucherInReport } from '@/utils/reportArrayUtils'
import { mapVoucherToFormProps, buildCompanionVoucher } from '@/utils/voucherFormUtils'
import { buildMenuItems } from '@/utils/voucherMenuItems'
import type { Voucher, VoucherFormInitialValues } from '@/types/Voucher'
import VoucherForm from '@/components/vouchers/VoucherForm.vue'

const props = withDefaults(
  defineProps<{
    review?: boolean
    report: object[]
    totalRevenue: number
  }>(),
  {
    review: false
  }
)

const emit = defineEmits(['approveVoucher', 'rejectVoucher'])

const reportStore = useReportStore()
const voucherStore = useVoucherStore()
const { reportLoading } = storeToRefs(reportStore)

const { localizedShortDateTime } = useTimeUtils()
const { formatCurrency } = useCurrencyUtils()

function refresh() {
  reportStore.fillReport()
}

function print() {
  window.print()
}

const isRejectDialogVisible: Ref<boolean> = ref(false)
const rejectMessage: Ref<string> = ref('')
const rejectVoucherId: Ref<string> = ref('')
const rejectMessageTouched = ref(false)

function handleDisplayRejectModal(id: string) {
  console.log(id)
  rejectVoucherId.value = id
  isRejectDialogVisible.value = true
  rejectMessageTouched.value = false
}

function handleReject() {
  emit('rejectVoucher', rejectVoucherId.value, rejectMessage.value)
  isRejectDialogVisible.value = false
  rejectMessageTouched.value = false
}

// Context menu state
const contextMenu: Ref<InstanceType<typeof ContextMenu> | null> = ref(null)
const selectedVoucher: Ref<Voucher | null> = ref(null)
const isDeleteVisible: Ref<boolean> = ref(false)
const isEditVisible: Ref<boolean> = ref(false)
const isConvertVisible: Ref<boolean> = ref(false)
const actionLoading: Ref<boolean> = ref(false)
const actionError: Ref<string | null> = ref(null)

function openDelete() { actionError.value = null; isDeleteVisible.value = true }
function openEdit() { actionError.value = null; isEditVisible.value = true }
function openConvert() { actionError.value = null; isConvertVisible.value = true }

const menuItems = computed(() =>
  buildMenuItems(selectedVoucher.value, { openDelete, openEdit, openConvert })
)

function onRowContextMenu(event: { originalEvent: MouseEvent; data: Voucher }) {
  selectedVoucher.value = event.data
  contextMenu.value?.show(event.originalEvent)
}

async function handleDeleteConfirm() {
  if (!selectedVoucher.value) return
  actionLoading.value = true
  actionError.value = null
  const success = await deleteVoucher(selectedVoucher.value.id)
  if (success) {
    isDeleteVisible.value = false
    await reportStore.fillReport()
  } else {
    actionError.value = 'Failed to delete the voucher. Please try again.'
  }
  actionLoading.value = false
}

async function handleEditSubmit(payload: VoucherFormInitialValues) {
  if (!selectedVoucher.value) return
  const oldId = selectedVoucher.value.id
  actionLoading.value = true
  actionError.value = null

  const newVoucher = await voucherStore.recreateVoucher(oldId, {
    bsNumber:     payload.bsNumber,
    roomNumber:   payload.roomNumber ?? 0,
    customerName: payload.customerName,
    umbrellas:    payload.umbrellas,
    beds:         payload.beds,
    checkIn:      payload.checkIn,
    checkOut:     payload.checkOut,
    friendly:     payload.friendly,
  })

  if (!newVoucher) {
    actionError.value = 'Failed to update the voucher. Please try again.'
    actionLoading.value = false
    return
  }

  isEditVisible.value = false
  await reportStore.fillReport()
  actionLoading.value = false
}

async function handleConvertConfirm() {
  if (!selectedVoucher.value) return
  const voucherId = selectedVoucher.value.id
  actionLoading.value = true
  actionError.value = null

  // Step 1: Update the voucher to friendly=true
  const updatedVoucher = await updateVoucher(voucherId, { friendly: true })
  if (!updatedVoucher) {
    actionError.value = 'Failed to update the voucher. No changes were made.'
    actionLoading.value = false
    return
  }

  // Step 2: Create the companion ANNULLATO voucher with pricing details
  const companion = await voucherStore.createVoucherWithDetails(buildCompanionVoucher(selectedVoucher.value))
  if (!companion) {
    // Attempt to revert the friendly=true change
    const reverted = await updateVoucher(voucherId, { friendly: false })
    if (!reverted) {
      actionError.value =
        'Critical error: The voucher was converted but the companion could not be created and the revert also failed. Please reload the page.'
    } else {
      actionError.value = 'The companion voucher could not be created. The conversion was reverted.'
    }
    actionLoading.value = false
    return
  }

  // Both succeeded
  isConvertVisible.value = false
  await reportStore.fillReport()
  actionLoading.value = false
}

</script>

<template lang="pug">
div.list-container
  ContextMenu(ref="contextMenu" :model="menuItems")
  Card.spinner-card(v-if="false" )
    template(#content)
      div.spinner-wrapper
        ProgressSpinner()

  Card()
    template(#title)
      div.table-commands
        p.card-title-text {{ review ? "Review" : "Report" }}
        slot(name="title")

    template(#content).list
      DataTable(
        :value="report"
        :lazy="true"
        scrollable
        :loading="reportLoading"
        size="normal"
        scroll-height="flex"
        striped-rows
        :context-menu-selection="selectedVoucher"
        @row-contextmenu="onRowContextMenu"
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
                @click="handleDisplayRejectModal(slotProps.data.id)")



        Column(field="voucherStatus" v-else).center-text
          template(#body="slotProps")
            Tag(:value="VoucherStatus[slotProps.data.voucherStatus].text.toUpperCase()"
              :severity="VoucherStatus[slotProps.data.voucherStatus].color")

          template(#editor="{ data, field }")
            Select(v-model="data.voucherStatus" editable :options="VoucherStatuses" optionLabel="text"
              placeholder="Status")

        ColumnGroup(type="footer" :frozen="true" v-if="!review")
          Row(:frozen="true")
            Column(footer="Totals:" :colspan="11" ).right-text
            Column(:footer="formatCurrency(totalRevenue)").right-text
            Column(footer="")
          //Row(:frozen="true")
          //  Column(footer="Tax base:" :colspan="11" ).right-text
          //  Column(:footer="formatCurrency(totalRevenue/1.22)").right-text
          //  Column(footer="")
          //Row(:frozen="true")
          //  Column(footer="Extra:" :colspan="11" ).right-text
          //  Column(:footer="formatCurrency(100)").right-text
          //  Column(footer="")
          //Row(:frozen="true")
          //  Column(footer="Final Totals:" :colspan="11" ).right-text
          //  Column(:footer="formatCurrency(totalRevenue/1.22+100)").right-text
          //  Column(footer="")

  Dialog(v-model:visible="isDeleteVisible" modal header="Delete Voucher")
    p(v-if="selectedVoucher") Are you sure you want to delete voucher for #[span {{ selectedVoucher.customerName }}] (BS ##[span {{ selectedVoucher.bsNumber }}])?
    Message(v-if="actionError" severity="error" size="small" variant="simple") {{ actionError }}
    template(#footer)
      Button(label="Cancel" severity="secondary" @click="isDeleteVisible = false" :disabled="actionLoading")
      Button(label="Confirm" severity="danger" @click="handleDeleteConfirm" :loading="actionLoading" :disabled="actionLoading")

  Dialog(v-model:visible="isEditVisible" modal header="Edit Voucher")
    div(v-if="actionLoading" style="position:absolute;inset:0;background:rgba(255,255,255,0.5);z-index:1")
    Message(v-if="actionError" severity="error" size="small" variant="simple") {{ actionError }}
    VoucherForm(
      v-if="selectedVoucher"
      :initial-values="mapVoucherToFormProps(selectedVoucher)"
      :friendly-disabled="true"
      @submit="handleEditSubmit"
    )

  Dialog(v-model:visible="isConvertVisible" modal header="Convert to A")
    p(v-if="selectedVoucher") Are you sure you want to convert this voucher to A? Customer: #[span {{ selectedVoucher.customerName }}], BS ##[span {{ selectedVoucher.bsNumber }}]
    Message(v-if="actionError" severity="error" size="small" variant="simple") {{ actionError }}
    template(#footer)
      Button(label="Cancel" severity="secondary" @click="isConvertVisible = false" :disabled="actionLoading")
      Button(label="Confirm" @click="handleConvertConfirm" :loading="actionLoading" :disabled="actionLoading")

  Dialog(
    v-model:visible="isRejectDialogVisible"
    modal
    header="Voucher correction request"
  ).reject-voucher-dialog
    div.reject-voucher-layout
      div
      span Please describe the issue with this voucher
      div.reject-voucher-error-message
        FloatLabel(variant="in")
          Textarea(
            v-model="rejectMessage"
            id="rejectMessage"
            autocomplete="off"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': rejectMessageTouched && rejectMessage.length < 5 }"
            @blur="rejectMessageTouched = true"
            placeholder="Esempi: \n - Checkout: 15/06/2025\n - Lettini: 2 \n - ..."
            autofocus
            :fluid="true"
          )
          label(for="rejectMessage") Correction details

          Message(
            v-if="rejectMessageTouched && rejectMessage.length < 10"
            severity="error"
            size="small"
            variant="simple"
          ) Your message must be at least 10 characters long

      div.reject-voucher-buttons
        Button(type="button" label="Cancel" severity="secondary" @click="isRejectDialogVisible = false")
        Button(type="button" label="Reject" @click="handleReject" :disabled="rejectMessage.length < 10")


</template>

<style lang="scss">
.reject-voucher-dialog {
  width: 500px;
}

.reject-voucher-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: end;
}

.reject-voucher-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-commands {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title-text {
  white-space: nowrap;
  flex-shrink: 0;
}
.commands-buttons,
.review-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
.list-container {
  flex: 1;
  height: 100%;

  div.p-card.p-component,
  div.p-card-body {
    height: 100%;

    div.p-card-title {
      display: flex !important;
      width: 100%;
      align-items: center;
    }

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
    color: var(--p-datatable-row-color);
  }

  .p-card-body {
    padding: 0 !important;
  }

  .p-button,
  div.p-card-header *,
  div.p-card-footer * {
    display: none !important;
  }

  .list-container,
  .list-container * {
    visibility: visible !important;
  }

  /* Hide title bar (report title + filter bar) in print */
  .list-container .p-card-caption,
  .list-container .p-card-caption * {
    visibility: hidden !important;
    display: none !important;
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
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
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

@media print {
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>