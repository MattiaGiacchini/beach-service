<script setup lang="ts">
import Logo from '@/assets/Logo.vue'
import { ref } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const store = useUserStore()
const { userLoading } = storeToRefs(store)

const email = ref('')
const password = ref('')

async function login() {
  if (email.value && password.value) {
    await useUserStore().login(email.value, password.value)
  }
}
</script>

<template lang="pug">
Card
  template(#content)
    div.login-form
      Logo.login-logo
      divider
      form(v-focustrap).form-container
        div.form-row
          FloatLabel(variant="in")
            InputText(id="email" v-model="email" :fluid="true")
            label(for="email" ) E-mail

        div.form-row
          FloatLabel(variant="in")
            Password(v-model="password" id="password" :fluid="true")
            label(for="password") Password

        div.form-row
          Button(label='Sign In' :fluid="true" @click="login" :loading="userLoading")


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
