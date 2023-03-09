import { defineStore } from 'pinia'

export const useStore = defineStore('user', {
  // arrow function recommended for full type inference
  state: () => {
    return {
      // all these properties will have their type inferred automatically
      userInfo: null
    }
  },
})