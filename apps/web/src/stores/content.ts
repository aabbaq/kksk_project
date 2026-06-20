import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useContentStore = defineStore('content', () => {
  const textId = ref('')
  const ownerId = ref('')

  function setArticle (payload: { id: string, ownerId?: string }) {
    textId.value = payload.id
    ownerId.value = payload.ownerId ?? ''
  }

  function clear () {
    textId.value = ''
    ownerId.value = ''
  }

  return { textId, ownerId, setArticle, clear }
})
