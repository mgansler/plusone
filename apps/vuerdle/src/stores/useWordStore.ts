import { defineStore } from 'pinia'

import words from '../assets/words.json'

const DAY_MS = 1_000 * 3_600 * 24

export const useWordStore = defineStore('word', {
  state: () => ({ count: words.length }),
  getters: {
    isValidWord:
      () =>
      (word: string): boolean => {
        return words.includes(word)
      },
    wordForDay:
      (state) =>
      (date: Date): string => {
        // TODO: better algorithm for setting the word
        const timestamp = date.valueOf()
        return words[Math.floor(timestamp / DAY_MS) % state.count]
      },
  },
})
