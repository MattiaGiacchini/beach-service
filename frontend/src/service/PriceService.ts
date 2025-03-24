import { http } from '@/composable/http'
import type { Price, PriceCreationRequest } from '@/types/Prices'
import type { AxiosResponse } from 'axios'
import { supabase } from '@/composable/supabase'

const URL_PRICE: string = '/prices'

async function getPrices(): AxiosResponse<Price[]> {
  const { data, error } = await supabase.from('prices').select() // return http
  console.log(data)
  return data
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
