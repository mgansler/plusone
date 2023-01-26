<template>
  <div class="app-root">
    <h1>Welcome vuerdle</h1>

    <CNav>
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/calendar" class="nav-link">Calendar</RouterLink>
    </CNav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { CNav } from '@coreui/vue'
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app-root {
  height: 100vh;
  width: 100vw;
}
</style>
