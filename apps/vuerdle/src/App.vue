<template>
  <div @keydown="keydown" tabindex="0">
    <h1>Welcome vuerdle</h1>
    <HelloWorld />

    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/calendar">Calendar</RouterLink>
    </nav>

    <WordRow :word="gameState.guesses[0]" :check-result="gameState.results[0]" />
    <WordRow :word="gameState.guesses[1]" :check-result="gameState.results[1]" />
    <WordRow :word="gameState.guesses[2]" :check-result="gameState.results[2]" />
    <WordRow :word="gameState.guesses[3]" :check-result="gameState.results[3]" />
    <WordRow :word="gameState.guesses[4]" :check-result="gameState.results[4]" />
    <WordRow :word="gameState.guesses[5]" :check-result="gameState.results[5]" />

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import WordRow from './components/WordRow.vue'
import { useGameStore } from './stores/useGameStore'
import { useWordStore } from './stores/useWordStore'

const wordStore = useWordStore()

const gameState = useGameStore()
gameState.setGuessWord(wordStore.wordForDay(new Date()))

// watch([gameState], (newValue, oldValue) => {
//   console.log(newValue, oldValue)
// })

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

<style scoped></style>
