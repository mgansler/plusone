<template>
  <CContainer @keydown="keydown" tabindex="0" class="game">
    <WordRow :word="gameState.guesses[0]" :check-result="gameState.results[0]" />
    <WordRow :word="gameState.guesses[1]" :check-result="gameState.results[1]" />
    <WordRow :word="gameState.guesses[2]" :check-result="gameState.results[2]" />
    <WordRow :word="gameState.guesses[3]" :check-result="gameState.results[3]" />
    <WordRow :word="gameState.guesses[4]" :check-result="gameState.results[4]" />
    <WordRow :word="gameState.guesses[5]" :check-result="gameState.results[5]" />
  </CContainer>
</template>

<script setup lang="ts">
import { CContainer } from '@coreui/vue'
import { useGameStore } from '../stores/useGameStore'
import WordRow from './WordRow.vue'

type Props = {
  word: string
}

const props = defineProps<Props>()

const gameState = useGameStore()
gameState.setGuessWord(props.word)

function keydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter': {
      gameState.check()
      break
    }

    case 'Backspace': {
      gameState.removeChar()
      break
    }

    default: {
      gameState.addChar(event.key)
    }
  }
}
</script>

<style scoped>
.game {
  height: 100%;
}
</style>
