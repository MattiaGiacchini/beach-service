<script setup lang="ts">
import Logo from '@/assets/Logo.vue'
import { ref } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import router from '@/router'

const store = useUserStore()
const { userLoading } = storeToRefs(store)

const email = ref('')
const password = ref('')

function disableButton() {
  return !(email.value && password.value)
}

async function submitForm() {
  if (!disableButton()) {
    try {
      await useUserStore().login(email.value, password.value)
      router.push('/prices')
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<template lang="pug">
Card
  template(#content)
    div.login-form
      Logo.login-logo
      divider
      form(v-focustrap @submit.prevent="submitForm" @keydown.enter="submitForm").form-container
        div.form-row
          FloatLabel(variant="in")
            InputText(id="email" v-model="email" :fluid="true")
            label(for="email" ) E-mail

        div.form-row
          FloatLabel(variant="in")
            Password(v-model="password" id="password" :fluid="true" toggleMask)
            label(for="password") Password

        div.form-row
          Button(label='Sign In' :fluid="true" @click="submitForm" :loading="userLoading" :disabled="disableButton()")


</template>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.login-logo {
  width: 50%;
  padding: 10% 0;
}

.form-container {
  width: 100%;
  padding: 10%;
}
</style>
