import { supabase } from '@/composables/supabase'
import type { Price, PriceCreationRequest } from '@/types/Prices'
import { useToastMessage } from '@/composables/toastMessage'

const { showErrorToast } = useToastMessage()

async function getPrices(): Promise<Price[]> {
  try {
    const { data, error } = await supabase
      .from('prices')
      .select()
      .order('year', { ascending: false })
      .order('startDate', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error: any) {
    showErrorToast(error)
    return []
  }
}

async function createPrice(price: PriceCreationRequest): Promise<Price | null> {
  try {
    const { data, error } = await supabase.from('prices').insert([price]).select()
    if (error) throw error
    return data?.[0] ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function updatePrice(price: Price): Promise<Price | null> {
  try {
    const { data, error } = await supabase.from('prices').update(price).eq('id', price.id).select()

    if (error) throw error

    return data?.[0] ?? null
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

export { getPrices, createPrice, updatePrice }
