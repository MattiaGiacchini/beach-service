<script setup>
import Menubar from 'primevue/menubar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '@/assets/Logo.vue'

const items = ref([])

onMounted(async () => {
  const { routes } = await import('@/router/routes')
  items.value = routes
    .filter((route) => route.meta.showInMenu)
    .map((route) => ({
      label: route.meta.title,
      icon: route.meta.icon,
      route: route.path
    }))
})

const router = useRouter()

const isDarkTheme = ref(false)
function toggleDarkMode() {
  isDarkTheme.value = !isDarkTheme.value

  if (isDarkTheme.value) {
    document.documentElement.classList.add('p-dark')
  } else {
    document.documentElement.classList.remove('p-dark')
  }

  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  setFavicon(isDarkTheme.value ? 'dark' : 'light')
}

onMounted(() => {
  isDarkTheme.value = localStorage.getItem('theme') === 'dark'
  setFavicon(isDarkTheme.value ? 'dark' : 'light')

  if (isDarkTheme.value) {
    document.documentElement.classList.add('p-dark')
  }
})

function setFavicon(theme) {
  const favicon = document.querySelector("link[rel='icon']") || document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = theme === 'dark' ? '/favicon-dark.ico' : '/favicon-light.ico'
  document.head.appendChild(favicon)
}
</script>

<template lang="pug">
Menubar(:model="items")
  template(#start)
    Logo.menu-logo
  template(#item="{ item, props }")
    router-link(v-slot="{ href, navigate }" :to="item.route" custom)
      a(:href="href" v-bind="props.action" @click="navigate")
        span(:class="item.icon")
        span.ml-2 {{ item.label }}
  template(#end)
    Button( :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'" rounded variant="outlined" aria-label="Filter"
      severity="secondary" @click="toggleDarkMode()")
</template>

<style lang="scss">
.menu-logo {
  height: 40px;
}
</style>
