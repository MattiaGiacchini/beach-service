import { supabase } from '@/composable/supabase'
import { useToast } from 'primevue/usetoast'
import type { AuthResponsePassword } from '@supabase/supabase-js'

async function loginUser(email: string, password: string): Promise<AuthResponsePassword> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    const toast = useToast()
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error logging in: ${error.message}`,
      life: 3000
    })
  }
}

async function signupUser(email: string, password: string) {
  const toast = useToast()
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      throw error
    }
    return data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error signing up: ${error.message}`,
      life: 3000
    })
  }
}

async function logoutUser() {
  const toast = useToast()
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error en logout:', error)
    throw error
  }
}

async function checkSession() {
  const toast = useToast()
  try {
    return supabase.auth.check()
  } catch (error) {
    console.error('Error en checkSession:', error)
    throw error
  }
}

export { loginUser, logoutUser, signupUser, checkSession }
