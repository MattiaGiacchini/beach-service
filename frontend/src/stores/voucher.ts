import { computed, type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Price, PriceCreationRequest } from '@/types/Prices'
import type { AxiosResponse } from 'axios'
import { createPrice, getPrices, updatePrice } from '@/service/PriceService'
import { getVouchers } from '@/service/VoucherService'
import type { BeachService } from '@/types/BeachService'

export const useVoucherStore = defineStore('voucher', () => {
  const voucherLoading: Ref<boolean> = ref(false)

  const bsNumber: Ref<number> = ref(0)
  const name: Ref<string> = ref('')
  const umbrellas: Ref<number> = ref(0)
  const beds: Ref<number> = ref(0)
  const room: Ref<number | undefined> = ref(undefined)
  const friendly: Ref<boolean> = ref(false)

  const dates = ref()

  const checkIn = computed(() => dates?.value[0])
  const checkOut = computed(() => dates?.value[1])

  const vouchers: Ref<BeachService> = ref([])
  const lastVouchers: Ref<BeachService> = ref([])

  function $reset() {
    bsNumber.value = 0
    name.value = ""
    umbrellas.value = 0
    beds.value = 0
    room.value = undefined
    friendly.value = false
    dates.value = null
  }

  async function fillVouchers() {
    await fetchVouchers('desc', undefined, vouchers);
  }

  async function fillLastVouchers(limit?: number) {
    await fetchVouchers('asc', limit, lastVouchers);
  }
  async function fetchVouchers(sortingOrder: 'asc' | 'desc' = 'desc', limit?: number, targetVariable: any) {
    voucherLoading.value = true

    const response: AxiosResponse = await getVouchers(sortingOrder, limit)

    if (response.data) {
      targetVariable.value = response.data;
    }

    voucherLoading.value = false
  }

  async function addVoucher() {
    voucherLoading.value = true

    const priceCreation: PriceCreationRequest = {
      ...(name && { name: name.value }),
      price: price.value,
      startDate: startDate.value,
      endDate: endDate.value,
      year: new Date(startDate.value).getFullYear()
    }

    const response: AxiosResponse = await createPrice(priceCreation)
    if (response.data) {
      prices.value = response.data
      $reset()
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

  return {
    bsNumber,
    name,
    umbrellas,
    beds,
    room,
    friendly,
    dates,
    voucherLoading,
    addVoucher,
    fillVouchers,
    fillLastVouchers,
    vouchers,
    lastVouchers
  }


})
