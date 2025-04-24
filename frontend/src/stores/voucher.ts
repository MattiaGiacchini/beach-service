import { computed, type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Price } from '@/types/Prices'
import type { AxiosResponse } from 'axios'
import { updatePrice } from '@/service/PriceService'
import {
  createVoucher,
  createVoucherPeriodsDetails,
  getLastVoucherNumber,
  getLastVouchers,
  getOldCustomersNames
} from '@/service/VoucherService'
import type { BeachService } from '@/types/BeachService'
import type { Voucher, VoucherCreation } from '@/types/Voucher'
import { useTimeUtils } from '@/composables/timeUtils'
import { useToastMessage } from '@/composables/toastMessage'
import { usePricesStore } from '@/stores/prices'
import { supabase } from '@/composables/supabase'

export const useVoucherStore = defineStore('voucher', () => {
  const voucherLoading: Ref<boolean> = ref(false)

  const bsNumber: Ref<number> = ref(0)
  const customerName: Ref<string> = ref('')
  const umbrellas: Ref<number> = ref(0)
  const beds: Ref<number> = ref(0)
  const roomNumber: Ref<number | undefined> = ref(undefined)
  const friendly: Ref<boolean> = ref(false)

  const dates = ref()

  const checkIn = computed(() => dates?.value[0])
  const checkOut = computed(() => dates?.value[1])

  const vouchers: Ref<BeachService> = ref([])
  const lastVouchers: Ref<BeachService> = ref([])
  const lastVoucherNumber = ref()

  const oldCustomersNames: Ref<string[]> = ref([])

  const { formatDateToYMD } = useTimeUtils()

  function $reset() {
    bsNumber.value = 0
    customerName.value = ''
    umbrellas.value = 0
    beds.value = 0
    roomNumber.value = undefined
    friendly.value = false
    dates.value = null
  }

  async function fillVouchers() {
    //
  }

  async function fillLastVouchers(limit: number = 10) {
    voucherLoading.value = true

    const response: AxiosResponse<Price[]> = await getLastVouchers(limit)
    if (response) {
      lastVouchers.value = response
    }

    voucherLoading.value = false
  }

  async function fillLastVoucherNumber() {
    voucherLoading.value = true

    const response: number = await getLastVoucherNumber()
    if (response) {
      bsNumber.value = response + 1
    }

    voucherLoading.value = false
  }
  async function fillOldCustomersNames() {
    voucherLoading.value = true

    const response: { customerName: string }[] = await getOldCustomersNames()

    if (response) {
      oldCustomersNames.value = [...new Set(response.map((customer) => customer.customerName))]
    }

    voucherLoading.value = false
  }

  async function addVoucher() {
    voucherLoading.value = true

    const voucherCreation: VoucherCreation = {
      ...(roomNumber.value && { roomNumber: roomNumber.value }),
      checkIn: formatDateToYMD(checkIn.value),
      checkOut: formatDateToYMD(checkOut.value),
      bsNumber: bsNumber.value,
      customerName: customerName.value,
      umbrellas: umbrellas.value,
      beds: beds.value,
      friendly: friendly.value,
      ...(umbrellas.value === 0 && beds.value === 0 && { voucherStatus: 'cancelled' })
    }

    const response: Voucher = await createVoucher(voucherCreation)
    if (response) {
      if (usePricesStore().prices.length < 1) {
        await usePricesStore().fillPrices()
      }

      const bedsVariation = getBedsVariation(response.umbrellas, response.beds)
      const umbrellasVariation = response.umbrellas

      const splits = splitPeriods(
        response,
        usePricesStore().prices,
        bedsVariation,
        umbrellasVariation
      )
      if (splits.length) {
        await createVoucherPeriodsDetails(splits)
      }

      $reset()
      await fillLastVouchers()
      await fillLastVoucherNumber()
    }

    voucherLoading.value = false
  }

  async function modifyPrice(newPrice: Price) {
    voucherLoading.value = true

    const response: AxiosResponse = await updatePrice(newPrice)
    if (response.data) {
      await fillPrices()
    }

    voucherLoading.value = false
  }

  function splitPeriods(voucher, pricingPeriods, bedsVariation, umbrellasVariation) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000
    return pricingPeriods.flatMap((pricingPeriod) => {
      const overlapStartDate = new Date(
        Math.max(new Date(pricingPeriod.startDate).getTime(), new Date(voucher.checkIn).getTime())
      )
      const overlapEndDate = new Date(
        Math.min(new Date(pricingPeriod.endDate).getTime(), new Date(voucher.checkOut).getTime())
      )
      if (overlapStartDate <= overlapEndDate) {
        const daysCount =
          (overlapEndDate.getTime() - overlapStartDate.getTime()) / millisecondsPerDay + 1

        return [
          {
            voucherId: voucher.id,
            priceId: pricingPeriod.id,
            days: daysCount,
            bedsVariation,
            umbrellasVariation
          }
        ]
      }
      return []
    })
  }

  function getBedsVariation(umbrellas, beds) {
    return (beds - 2 * umbrellas) * 0.2
  }

  //
  async function fixNextBatch() {
    const { data: missingVouchers, error } = await supabase
      .from('vouchers_without_pricing_details')
      .select('*')
      .order('checkIn')
      .limit(100)

    if (error || !missingVouchers?.length) {
      console.log('Nothing to fix or error:', error)
      return
    }

    if (usePricesStore().prices.length < 1) {
      await usePricesStore().fillPrices()
    }

    const allSplits = []

    for (const voucher of missingVouchers) {
      const bedsVariation = getBedsVariation(voucher.umbrellas, voucher.beds)
      const umbrellasVariation = voucher.umbrellas

      const splits = splitPeriods(
        voucher,
        usePricesStore().prices,
        bedsVariation,
        umbrellasVariation
      )

      if (splits.length) {
        console.log(voucher.customerName, voucher.bsNumber, voucher.umbrellas, voucher.beds, splits)
        allSplits.push(...splits)
      } else {
        console.warn(`No splits for voucher ${voucher.id}`)
      }
    }

    if (allSplits.length) {
      await createVoucherPeriodsDetails(allSplits)
      console.log(`Inserted ${allSplits.length} pricing details`, allSplits)
    } else {
      console.log('No pricing details to insert')
    }
  }

  return {
    bsNumber,
    customerName,
    umbrellas,
    beds,
    roomNumber,
    friendly,
    dates,
    voucherLoading,
    addVoucher,
    fillVouchers,
    fillLastVouchers,
    fillLastVoucherNumber,
    lastVoucherNumber,
    vouchers,
    lastVouchers,
    fillOldCustomersNames,
    oldCustomersNames,
    fixNextBatch
  }
})
