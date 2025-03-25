import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import PricesView from '@/views/PricesView.vue'
import VoucherView from '@/views/VoucherView.vue'
import ReportView from '@/views/ReportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView
    },
    {
      path: '/prices',
      name: 'prices',
      component: PricesView
    },
    {
      path: '/beach-service',
      name: 'beach-service',
      component: VoucherView
    }
  ]
})

router.beforeEach((to, from) => {
  document.title = to.meta?.title ?? 'Beach Service'
})

export default router
