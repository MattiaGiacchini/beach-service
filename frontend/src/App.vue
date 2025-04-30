<script setup lang="ts">
import TheMenu from '@/components/TheMenu.vue'
import Toast from 'primevue/toast'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useVoucherStore } from '@/stores/voucher'
import { onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { toastBus, type ToastPayload } from '@/plugins/toastBus'

const userStore = useUserStore()
const { isUserAuthenticated } = storeToRefs(userStore)

useVoucherStore().fillOldCustomersNames()

const toast = useToast()

const handler = (payload: ToastPayload) => {
  toast.add({
    severity: payload.severity,
    summary: payload.summary,
    detail: payload.detail,
    life: payload.life ?? 3000
  })
}

onMounted(() => toastBus.on('toast', handler))
onUnmounted(() => toastBus.off('toast', handler))
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
