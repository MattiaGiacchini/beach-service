<template>
  <Menubar :model="items">
    <template #start>
      <svg
        width="35"
        height="40"
        viewBox="0 0 35 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-2rem"
      >
        <path d="..." fill="var(--primary-color)" />
        <path d="..." fill="var(--text-color)" />
      </svg>
    </template>
    <template #item="{ item, props }">
      <router-link v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </router-link>
    </template>
    <template #end>
      <ToggleButton
        v-model="isDarkTheme"
        @update:model-value="toggleDarkMode"
        onLabel="Dark"
        offLabel="Light"
        onIcon="pi pi-moon"
        offIcon="pi pi-sun"
        size="large"
      />
    </template>
  </Menubar>
</template>

<script setup>
import Menubar from 'primevue/menubar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'

const router = useRouter()

const isDarkTheme = ref(false)
function toggleDarkMode() {
  if (isDarkTheme.value) {
    document.documentElement.classList.add('p-dark')
  } else {
    document.documentElement.classList.remove('p-dark')
  }

  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

const options = ref([
  { icon: 'pi pi-sun', value: 'false', label: 'Light' },
  { icon: 'pi pi-moon', value: 'true', label: 'Dark' }
])

onMounted(() => {
  isDarkTheme.value = localStorage.getItem('theme') === 'dark'

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
    label: 'About',
    icon: 'pi pi-palette',
    route: 'about'
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
</script>
