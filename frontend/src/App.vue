<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template lang="pug">
div.layout
  TheMenu
  RouterView
</template>

<style scoped>
.layout {
  max-width: 100vw;
  min-width: 100vw;
  overflow: clip;
}
</style>
