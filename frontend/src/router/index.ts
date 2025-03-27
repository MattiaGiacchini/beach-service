import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router/routes'

import Cookies from 'universal-cookie'
const cookies = new Cookies()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, from, next) => {
  const isUserAuthenticated = !!cookies.get('auth_token')

  if (!isUserAuthenticated && to.name !== 'Login') {
    next({ name: 'Login' })
  } else {
    next()
  }

  document.title = to.meta?.title ?? 'Beach Service'
})

export default router
