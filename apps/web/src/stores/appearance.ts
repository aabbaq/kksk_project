import { defineStore } from 'pinia'
import { ref } from 'vue'
import vuetify from '@/plugins/vuetify'
import {
  COLOR_LABELS,
  getDefaultSettings,
  STORAGE_KEY,
  THEME_PRESETS,
  type AppearanceColors,
  type AppearanceSettings,
  type ThemePresetId
} from '@/constants/themePresets'

function applyCssVars (colors: AppearanceColors) {
  const root = document.documentElement
  root.style.setProperty('--lothric-primary', colors.topbarBg)
  root.style.setProperty('--lothric-tabs-bg', colors.tabsBg)
  root.style.setProperty('--lothric-surface-elevated', colors.articleBg)
  root.style.setProperty('--lothric-footer-bg', colors.footbarBg)
  root.style.setProperty('--lothric-button-bg', colors.buttonBg)
}

export const useAppearanceStore = defineStore('appearance', () => {
  const presetId = ref<ThemePresetId>('purple')
  const colors = ref<AppearanceColors>(getDefaultSettings().colors)

  function applyVuetifyTheme () {
    const dark = vuetify.theme.themes.value.dark
    dark.colors.primary = colors.value.topbarBg
    dark.colors['surface-bright'] = colors.value.articleBg
  }

  function applyAll () {
    applyCssVars(colors.value)
    applyVuetifyTheme()
  }

  function load () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        applyAll()
        return
      }
      const parsed = JSON.parse(raw) as AppearanceSettings
      presetId.value = parsed.presetId ?? 'purple'
      colors.value = { ...getDefaultSettings().colors, ...parsed.colors }
    } catch {
      const defaults = getDefaultSettings()
      presetId.value = defaults.presetId
      colors.value = { ...defaults.colors }
    }
    applyAll()
  }

  function save () {
    const payload: AppearanceSettings = {
      presetId: presetId.value,
      colors: { ...colors.value }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    applyAll()
  }

  function applyPreset (id: ThemePresetId) {
    presetId.value = id
    colors.value = { ...THEME_PRESETS[id].colors }
    save()
  }

  function syncPresetId () {
    const matchesPreset = (Object.keys(THEME_PRESETS) as ThemePresetId[]).find((id) =>
      (Object.keys(colors.value) as Array<keyof AppearanceColors>).every(
        (k) => colors.value[k] === THEME_PRESETS[id].colors[k]
      )
    )
    if (matchesPreset) presetId.value = matchesPreset
  }

  function updateColor (key: keyof AppearanceColors, value: string) {
    colors.value[key] = value
    syncPresetId()
    save()
  }

  function resetToPreset () {
    applyPreset(presetId.value)
  }

  return {
    presetId,
    colors,
    colorLabels: COLOR_LABELS,
    presets: THEME_PRESETS,
    load,
    save,
    applyPreset,
    updateColor,
    resetToPreset,
    applyAll
  }
})
