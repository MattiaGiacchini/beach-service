import { supabase } from '@/composables/supabase'
import type { AuthResponsePassword } from '@supabase/supabase-js'
import { useToastMessage } from '@/composables/toastMessage'

const { showErrorToast } = useToastMessage()

async function loginUser(email: string, password: string): Promise<AuthResponsePassword | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return data
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function signupUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error

    return data
  } catch (error: any) {
    showErrorToast(error)
    return null
  }
}

async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error
  } catch (error: any) {
    showErrorToast(error)
  }
}

export { loginUser, logoutUser, signupUser }
