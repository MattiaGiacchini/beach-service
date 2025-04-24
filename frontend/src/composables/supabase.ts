import { createClient } from '@supabase/supabase-js'

const options = {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' }
  }
}
export const supabase = createClient(
  import.meta.env.VITE_BACKEND_BASE_URL,
  import.meta.env.VITE_BACKEND_API_KEY,
  options
)
