import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { LOCALE_STORAGE_KEY, messages, type Locale } from '@/constants/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>('en')

  const t = computed(() => messages[locale.value])

  function load () {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') {
      locale.value = saved
    }
  }

  function setLocale (value: Locale) {
    locale.value = value
    localStorage.setItem(LOCALE_STORAGE_KEY, value)
  }

  return { locale, t, load, setLocale }
})
