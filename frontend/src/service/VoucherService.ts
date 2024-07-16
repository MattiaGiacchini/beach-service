import { http } from '@/composable/http'
import type { Price, PriceCreationRequest } from '@/types/Prices'

const URL_VOUCHER: string = '/voucher'

async function getVouchers(sort: 'asc' | 'desc' = 'desc', limit?: number) {
  const params = {
    ...(limit && { limit: limit }),
    ...(sort && { sort: sort })
  }

  return http
    .get(URL_VOUCHER, { params })
    .then(http.handleResponse)
    .catch((error) => {
      throw new Error(`Failed to fetch prices: ${error.message}`)
    })
}

async function createPrice(price: PriceCreationRequest) {
  return http
    .post(URL_VOUCHER, price)
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

export { getVouchers, createPrice, updatePrice }
