<template>
  <h1>Welcome vuerdle</h1>
  <HelloWorld />

  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/calendar">Calendar</RouterLink>
  </nav>

  <RouterView />
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<style scoped></style>
