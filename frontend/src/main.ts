import './assets/main.scss'
import 'primevue/resources/themes/lara-dark-blue/theme.css'
import FocusTrap from 'primevue/focustrap'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.directive('focustrap', FocusTrap)


app.mount('#app')




