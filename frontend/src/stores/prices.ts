import { computed, type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Price, PriceCreationRequest } from '@/types/Prices'
import type { AxiosResponse } from 'axios'
import { createPrice, getPrices, updatePrice } from '@/service/PriceService'
import { useTimeUtils } from '@/composables/timeUtils'

export const usePricesStore = defineStore('prices', () => {
  const prices: Ref<Price[] | undefined> = ref([])
  const editingPrices: Ref<Price[] | undefined> = ref([])
  const pricesLoading: Ref<boolean> = ref(false)

  const price: Ref<number> = ref(0)
  const name: Ref<string> = ref('')
  const dates = ref()

  const startDate = computed(() => dates?.value[0])
  const endDate = computed(() => dates?.value[1])

  const { formatDateToYMD } = useTimeUtils()

  function $reset() {
    price.value = 0
    name.value = ''
    dates.value = null
  }

  async function fillPrices() {
    pricesLoading.value = true

    const response: AxiosResponse<Price[]> = await getPrices()
    if (response) {
      prices.value = response

      if (prices.value) {
        prices.value.sort((a: Price, b: Price) => {
          return b.year - a.year
        })
      }
    }

    pricesLoading.value = false
  }

  async function addPrice() {
    pricesLoading.value = true

    const priceCreation: PriceCreationRequest = {
      ...(name && { name: name.value }),
      price: price.value,
      startDate: formatDateToYMD(startDate.value),
      endDate: formatDateToYMD(endDate.value),

      year: new Date(startDate.value).getFullYear()
    }

    const response: AxiosResponse = await createPrice(priceCreation)
    if (response.data) {
      prices.value = response.data
      $reset()
    }

    pricesLoading.value = false
  }

  async function modifyPrice(newPrice: Price) {
    pricesLoading.value = true

    const response: AxiosResponse = await updatePrice(newPrice)
    if (response.data) {
      await fillPrices()
    }

    pricesLoading.value = false
  }

  return {
    price,
    dates,
    name,
    prices,
    pricesLoading,
    fillPrices,
    addPrice,
    editingPrices,
    modifyPrice
  }
})
