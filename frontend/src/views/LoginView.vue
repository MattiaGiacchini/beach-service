<script setup lang="ts">
import LoginForm from '@/components/user/LoginForm.vue'
</script>

<template lang="pug">
div.login-container
  div.login-container__login-form
    LoginForm
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  &__login-form {
    width: 35%;
  }
}
</style>
