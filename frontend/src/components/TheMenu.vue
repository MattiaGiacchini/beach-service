<script setup>
import Menubar from 'primevue/menubar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '@/assets/Logo.vue'

const router = useRouter()

const isDarkTheme = ref(false)
function toggleDarkMode() {
  if (isDarkTheme.value) {
    document.documentElement.classList.add('p-dark')
  } else {
    document.documentElement.classList.remove('p-dark')
  }

  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  setFavicon(isDarkTheme.value ? 'dark' : 'light')
}

const options = ref([
  { icon: 'pi pi-sun', value: 'false', label: 'Light' },
  { icon: 'pi pi-moon', value: 'true', label: 'Dark' }
])

onMounted(() => {
  isDarkTheme.value = localStorage.getItem('theme') === 'dark'
  setFavicon(isDarkTheme.value ? 'dark' : 'light')

  if (isDarkTheme.value) {
    document.documentElement.classList.add('p-dark')
  }
})

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-palette',
    route: '/'
  },

  {
    label: 'Login',
    icon: 'pi pi-user',
    route: 'login'
  },

  {
    label: 'Prices',
    icon: 'pi pi-palette',
    route: 'prices'
  },

  {
    label: 'Beach Service',
    icon: 'pi pi-palette',
    route: 'beach-service'
  },

  {
    label: 'Report',
    icon: 'pi pi-palette',
    route: 'report'
  }
])

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
      ToggleButton(
        v-model="isDarkTheme"
        @update:model-value="toggleDarkMode"
        onLabel="Dark"
        offLabel="Light"
        onIcon="pi pi-moon"
        offIcon="pi pi-sun"
      )
</template>

<style lang="scss">
.menu-logo {
  height: 40px;
}
</style>
