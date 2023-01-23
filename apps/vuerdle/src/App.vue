<template>
  <div class="app-root">
    <h1>Welcome vuerdle</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/calendar">Calendar</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-root {
  height: 100vh;
  width: 100vw;
}
</style>
