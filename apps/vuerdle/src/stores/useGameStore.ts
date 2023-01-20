import { defineStore } from 'pinia'

import { useWordStore } from './useWordStore'

export type CharCheckResult = 'unchecked' | 'invalid' | 'correct' | 'wrong-position'

export const useGameStore = defineStore('game', {
  state: () => ({
    word: [] as string[],
    currentGuess: 0,
    // guesses: Array<string[]>(6).fill([]),
    guesses: [[] as string[], [] as string[], [] as string[], [] as string[], [] as string[], [] as string[]],
    results: Array<CharCheckResult[]>(6).fill(Array<CharCheckResult>(5).fill('unchecked')),
  }),
  actions: {
    setGuessWord(word: string) {
      this.word = word.split('')
    },
    addChar(char: string) {
      if (this.guesses[this.currentGuess].length < 5) {
        this.guesses[this.currentGuess].push(char)
      }
      console.log(this.guesses)
    },
    removeChar() {
      this.guesses[this.currentGuess].pop()
    },
    check() {
      console.log('checking...', this.currentGuess)
      if (this.guesses[this.currentGuess].length < 5) {
        return
      }

      const words = useWordStore()
      if (!words.isValidWord(this.guesses[this.currentGuess].join(''))) {
        alert('not a valid word')
        return
      }

      const result = this.guesses[this.currentGuess].map((char, index) => {
        if (this.word[index] === char) {
          return 'correct'
        }
        if (this.word.includes(char)) {
          return 'wrong-position'
        }
        return 'invalid'
      })

      this.results[this.currentGuess] = result
      if (result.every((res) => res === 'correct')) {
        alert('You win!')
        return
      }

      if (this.currentGuess === 5) {
        alert('You loose.')
        return
      }

      this.currentGuess++
    },
  },
  getters: {},
})
