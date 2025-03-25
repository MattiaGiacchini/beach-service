import { http } from '@/composable/http'
import type { Price, PriceCreationRequest } from '@/types/Prices'
import { supabase } from '@/composable/supabase'
import { useToast } from 'primevue/usetoast'

const URL_PRICE: string = '/prices'

async function getPrices(): Promise<Price[]> {
  const toast = useToast()

  try {
    const { data, error } = await supabase.from('prices').select()
    if (error) {
      throw error
    }
    return data || []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error fetching prices: ${error.message}`,
      life: 3000
    })

    return []
  }
}

async function createPrice(price: PriceCreationRequest) {
  return http
    .post(URL_PRICE, price)
    .then(http.handleResponse)
    .catch((error) => {
      throw new Error(`Failed to fetch prices: ${error.message}`)
    })
}

async function updatePrice(price: Price) {
  console.log('SERVICE', price)
  return http
    .put(`${URL_PRICE}/${price.id}`, price)
    .then(http.handleResponse)
    .catch((error) => {
      throw new Error(`Failed to fetch prices: ${error.message}`)
    })
}

export { getPrices, createPrice, updatePrice }
