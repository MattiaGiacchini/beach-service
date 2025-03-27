import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginUser, logoutUser } from '@/service/UserService'
import type { AuthResponsePassword, Session, User } from '@supabase/supabase-js'
import Cookies from 'universal-cookie'

export const useUserStore = defineStore('user', () => {
  const cookies = new Cookies()

  const userSession: Ref<Session | undefined> = ref(undefined)
  const user: Ref<User | undefined> = ref(undefined)
  const isUserAuthenticated: Ref<boolean> = ref(false)
  const userRole: Ref<string | 'reader'> = ref('reader')

  const userLoading: Ref<boolean> = ref(false)

  async function login(email: string, password: string) {
    userLoading.value = true

    const response: AuthResponsePassword = await loginUser(email, password)

    if (response) {
      user.value = response.user
      userSession.value = response.session

      const { access_token, expires_in } = response.session

      cookies.set('auth_token', access_token, { path: '/', maxAge: expires_in })
      checkSession()
    }

    userLoading.value = false
  }
  async function logout() {
    userLoading.value = true

    await logoutUser()

    user.value = undefined
    userSession.value = undefined
    cookies.remove('auth_token', { path: '/' })

    checkSession()
    userLoading.value = false
  }

  function checkSession() {
    isUserAuthenticated.value = !!cookies.get('auth_token')

    if (isUserAuthenticated.value) {
    }

    return isUserAuthenticated
  }

  checkSession()

  return {
    userSession,
    userLoading,
    user,
    login,
    logout,
    checkSession,
    isUserAuthenticated
  }
})
