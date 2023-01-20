<template>
  <div class="row">
    <CharacterTile :char="word[0]" :status="checkResult[0]" />
    <CharacterTile :char="word[1]" :status="checkResult[1]" />
    <CharacterTile :char="word[2]" :status="checkResult[2]" />
    <CharacterTile :char="word[3]" :status="checkResult[3]" />
    <CharacterTile :char="word[4]" :status="checkResult[4]" />
  </div>
</template>

<script setup lang="ts">
import { CharCheckResult } from '../stores/useGameStore'
import CharacterTile from './CharacterTile.vue'

type Props = {
  word: string[]
  checkResult: CharCheckResult[]
}

const props = defineProps<Props>()

// watch(
//   () => props.checkResult,
//   (newValue, oldValue) => {
//     console.log(oldValue, newValue)
//   },
// )
</script>

<style scoped>
.row {
  display: flex;
}
</style>
