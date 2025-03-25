import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Price } from '@/types/Prices'
import type { AxiosResponse } from 'axios'
import { loginUser } from '@/service/UserService'
import type { AuthResponsePassword, User } from '@supabase/supabase-js'

export const useUserStore = defineStore('user', () => {
  const userToken: Ref<string | undefined> = ref(undefined)
  const user: Ref<User | undefined> = ref(undefined)
  const userLoading: Ref<boolean> = ref(false)

  async function login(email: string, password: string) {
    userLoading.value = true

    const response: AuthResponsePassword = await loginUser(email, password)

    if (response) {
      user.value = response.user
      userToken.value = response.session.access_token
    }

    userLoading.value = false
  }
  async function logout() {}

  return {
    userToken,
    userLoading,
    user,
    login,
    logout
  }
})
