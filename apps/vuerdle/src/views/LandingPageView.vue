<template>
  <h2>Landing Page View</h2>
  <p>I know {{ count }} different words, today's word is {{ todaysWord }}</p>
</template>

<script setup lang="ts">
import { wordStore } from '../stores/wordStore'

const { count, wordForDay } = wordStore()
const todaysWord = wordForDay(new Date())
</script>

<style scoped></style>
