<template>
  <h2>Calendar View</h2>
  <VuerdleGame :word="word" />
</template>

<script setup lang="ts">
import VuerdleGame from '../components/VuerdleGame.vue'

const word = 'react'
</script>

<style scoped></style>
