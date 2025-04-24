<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheMenu from '@/components/TheMenu.vue'
import Toast from 'primevue/toast'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'

const userStore = useUserStore()
const { isUserAuthenticated } = storeToRefs(userStore)

useVoucherStore().fillOldCustomersNames()
</script>

<template lang="pug">
div.layout
  Toast
  TheMenu(v-show="isUserAuthenticated")
  div.q
      RouterView
</template>

<style scoped>
.layout {
  max-width: 100vw;
  min-width: 100vw;
  overflow: clip;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.q {
  flex-grow: 1;
  overflow: auto;
}
</style>
