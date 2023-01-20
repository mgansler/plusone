<template>
  <h2>Landing Page View</h2>
  <p>I know {{ wordStore.count }} different words, today's word is {{ todaysWord }}</p>
</template>

<script setup lang="ts">
import { useWordStore } from '../stores/useWordStore'

const wordStore = useWordStore()
const todaysWord = wordStore.wordForDay(new Date())
</script>

<style scoped></style>
