<template>
  <div class="tile" :class="{ correct: isCorrect, 'wrong-position': isWrongPosition }">
    {{ props.char?.toLocaleUpperCase() }}
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { CharCheckResult } from '../stores/useGameStore'

type Props = {
  char?: string
  status: CharCheckResult
}

const props = defineProps<Props>()
let isCorrect = props.status === 'correct'
let isWrongPosition = props.status === 'wrong-position'

watch(
  () => props.status,
  (newValue, oldValue) => {
    isCorrect = newValue === 'correct'
    isWrongPosition = newValue === 'wrong-position'
  },
)
</script>

<style scoped>
.tile {
  height: 30px;
  width: 30px;
  border: 1px solid black;
  text-align: center;
  line-height: 30px;
}

.correct {
  background-color: forestgreen;
}

.wrong-position {
  background-color: darkgoldenrod;
}
</style>
