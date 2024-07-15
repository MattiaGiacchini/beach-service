export type Price = {
  id: string
  name?: string
  startDate: string
  endDate: string
  price: number
  year: number
}

export type PriceCreationRequest = {
  name?: string
  startDate: string
  endDate: string
  price: number
  year: number
}
