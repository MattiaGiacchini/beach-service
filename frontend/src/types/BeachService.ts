export type BeachService = {
  id: number
  name: string
  checkIn: Date
  checkOut: Date
  days: number
  beds: number
  umbrellas: number
  umbrellaVariation: string
  bedVariation: string
  totalPrice: number
  periods: BeachServiceRentingPeriod[]
}

type BeachServiceRentingPeriod = {
  days: number
  price: number
  periodTotalPrice: number
}
