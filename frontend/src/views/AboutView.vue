<script setup lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <div class="flex flex-row gap-3">
    <div class="card flex flex-col 2xl:flex-row gap-3">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-user"></i>
        </InputGroupAddon>
        <InputText placeholder="Username" />
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputNumber placeholder="Price" />
        <InputGroupAddon>.00</InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>www</InputGroupAddon>
        <InputText placeholder="Website" />
      </InputGroup>
    </div>

    <div class="card flex flex-col 2xl:flex-row gap-3">
      <InputGroup>
        <Button label="Search" />
        <InputText placeholder="Keyword" />
      </InputGroup>

      <InputGroup>
        <InputText placeholder="Keyword" />
        <Button icon="pi pi-search" severity="warning" />
      </InputGroup>

      <InputGroup>
        <Button icon="pi pi-check" severity="success" />
        <InputText placeholder="Vote" />
        <Button icon="pi pi-times" severity="danger" />
      </InputGroup>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 50vh;
    display: flex;
    align-items: center;
  }
}
</style>
