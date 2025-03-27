import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ReportView from '@/views/ReportView.vue'
import PricesView from '@/views/PricesView.vue'
import VoucherView from '@/views/VoucherView.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Home',
      icon: 'pi pi-home',
      showInMenu: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Login',
      icon: 'pi pi-sign-in',
      showInMenu: false
    }
  },
  {
    path: '/report',
    name: 'report',
    component: ReportView,
    meta: {
      title: 'Report',
      icon: 'pi pi-chart-line',
      showInMenu: true
    }
  },
  {
    path: '/prices',
    name: 'prices',
    component: PricesView,
    meta: {
      title: 'Prices',
      icon: 'pi pi-tag',
      showInMenu: true
    }
  },
  {
    path: '/beach-service',
    name: 'beach-service',
    component: VoucherView,
    meta: {
      title: 'Beach Service',
      icon: 'pi pi-sun',
      showInMenu: true
    }
  }
]
