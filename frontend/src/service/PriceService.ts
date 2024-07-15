import { http } from '@/composable/http'
import type { Price, PriceCreationRequest } from '@/types/Prices'

const URL_PRICE: string = '/prices'

async function getPrices() {
  return http
    .get(URL_PRICE)
    .then(http.handleResponse)
    .catch((error) => {
      throw new Error(`Failed to fetch prices: ${error.message}`)
    })
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
