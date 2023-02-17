<template>
  <p>I know {{ wordStore.count }} different words, today's word is {{ todaysWord }}</p>
  <VuerdleGame :word="todaysWord" />
</template>

<script setup lang="ts">
import VuerdleGame from '../components/VuerdleGame.vue'
import { useWordStore } from '../stores/useWordStore'

const wordStore = useWordStore()
const todaysWord = wordStore.wordForDay(new Date())
</script>

<style scoped></style>
