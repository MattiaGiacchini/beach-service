<template>
  <div class="card">
    <Menubar :model="items">
      <template #start>
        <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-2rem">
          <path d="..." fill="var(--primary-color)"/>
          <path d="..." fill="var(--text-color)"/>
        </svg>
      </template>
      <template #item="{ item, props }">
        <router-link v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon"/>
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
  </div>
</template>

<script setup>

import Menubar from 'primevue/menubar';

import {ref} from "vue";
import {useRouter} from 'vue-router';

const router = useRouter();

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
  },

]);
</script>
