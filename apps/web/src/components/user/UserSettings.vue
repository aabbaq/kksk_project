<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppearanceStore } from '@/stores/appearance'
import { useLocaleStore } from '@/stores/locale'
import {
  THEME_PRESETS,
  type AppearanceColors,
  type ThemePresetId
} from '@/constants/themePresets'
import type { Locale } from '@/constants/i18n'

const appearance = useAppearanceStore()
const localeStore = useLocaleStore()
const { presetId, colors } = storeToRefs(appearance)
const { locale, t } = storeToRefs(localeStore)

const presetList = Object.entries(THEME_PRESETS) as Array<[ThemePresetId, typeof THEME_PRESETS[ThemePresetId]]>
const colorKeys = Object.keys(THEME_PRESETS.purple.colors) as Array<keyof AppearanceColors>

const draft = reactive<AppearanceColors>({ ...colors.value })
const draftPreset = reactive({ id: presetId.value })
const draftLocale = reactive({ value: locale.value })

const languageOptions = computed(() => [
  {
    value: 'zh' as Locale,
    glyph: '中',
    label: t.value.settings.languageZh,
    desc: t.value.settings.languageZhDesc
  },
  {
    value: 'en' as Locale,
    glyph: 'En',
    label: t.value.settings.languageEn,
    desc: t.value.settings.languageEnDesc
  }
])

const hexKeys: Array<keyof AppearanceColors> = [
  'pageBg',
  'surfaceBg',
  'articleBg',
  'topbarBg',
  'footbarBg',
  'tabsBg'
]

watch(colors, (value) => {
  Object.assign(draft, value)
  draftPreset.id = presetId.value
}, { deep: true })

watch(locale, (value) => {
  draftLocale.value = value
})

function toHexColor (value: string) {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value
  return '#2d0425'
}

function selectPreset (id: ThemePresetId) {
  draftPreset.id = id
  Object.assign(draft, THEME_PRESETS[id].colors)
}

function onColorInput (key: keyof AppearanceColors, value: string) {
  draft[key] = value
}

function saveSettings () {
  localeStore.setLocale(draftLocale.value as Locale)
  appearance.$patch({
    presetId: draftPreset.id as ThemePresetId,
    colors: { ...draft }
  })
  appearance.save()
}

function resetDraft () {
  const id = (draftPreset.id in THEME_PRESETS ? draftPreset.id : 'purple') as ThemePresetId
  selectPreset(id)
}
</script>

<template>
  <v-container class="lothric-container py-6">
    <h2 class="text-h5 font-weight-medium mb-2">{{ t.settings.title }}</h2>
    <p class="text-body-medium text-medium-emphasis mb-6">
      {{ t.settings.subtitle }}
    </p>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-2">{{ t.settings.language }}</h3>
      <p class="text-body-small text-medium-emphasis mb-5">{{ t.settings.languageHint }}</p>
      <div class="lothric-lang-picker" role="radiogroup" :aria-label="t.settings.language">
        <button
          v-for="option in languageOptions"
          :key="option.value"
          type="button"
          class="lothric-lang-picker__option"
          :class="{ 'lothric-lang-picker__option--active': draftLocale.value === option.value }"
          role="radio"
          :aria-checked="draftLocale.value === option.value"
          @click="draftLocale.value = option.value"
        >
          <span class="lothric-lang-picker__glyph">{{ option.glyph }}</span>
          <span class="lothric-lang-picker__text">
            <span class="lothric-lang-picker__label">{{ option.label }}</span>
            <span class="lothric-lang-picker__desc">{{ option.desc }}</span>
          </span>
          <v-icon
            v-if="draftLocale.value === option.value"
            class="lothric-lang-picker__check"
            size="18"
            icon="mdi-check-circle"
          />
        </button>
      </div>
    </section>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-4">{{ t.settings.presets }}</h3>
      <div class="d-flex flex-wrap ga-3">
        <v-card
          v-for="[id, preset] in presetList"
          :key="id"
          class="lothric-card lothric-preset-card"
          :class="{ 'lothric-preset-card--active': draftPreset.id === id }"
          width="140"
          @click="selectPreset(id)"
        >
          <div class="lothric-preset-card__swatches">
            <span :style="{ background: preset.colors.pageBg }" />
            <span :style="{ background: preset.colors.topbarBg }" />
            <span :style="{ background: preset.colors.tabsBg }" />
            <span :style="{ background: preset.colors.articleBg }" />
          </div>
          <v-card-text class="text-center text-body-small py-2">
            {{ preset.label }}
          </v-card-text>
        </v-card>
      </div>
    </section>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-4">{{ t.settings.customColors }}</h3>
      <div class="lothric-stack">
        <div
          v-for="key in colorKeys"
          :key="key"
          class="lothric-color-row"
        >
          <label class="lothric-color-row__label">{{ t.colorLabels[key] }}</label>
          <input
            v-if="hexKeys.includes(key)"
            type="color"
            class="lothric-color-row__picker"
            :value="toHexColor(draft[key])"
            @input="onColorInput(key, ($event.target as HTMLInputElement).value)"
          >
          <span v-else class="lothric-color-row__picker lothric-color-row__picker--text" />
          <v-text-field
            :model-value="draft[key]"
            density="compact"
            variant="underlined"
            hide-details
            class="lothric-color-row__hex"
            @update:model-value="onColorInput(key, String($event ?? ''))"
          />
        </div>
      </div>
    </section>

    <div class="d-flex flex-wrap ga-3">
      <v-btn variant="text" class="lothric-btn-blend" @click="saveSettings">
        {{ t.settings.save }}
      </v-btn>
      <v-btn variant="text" class="lothric-btn-blend" @click="resetDraft">
        {{ t.settings.reset }}
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.lothric-lang-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.lothric-lang-picker__option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid var(--lothric-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--lothric-surface) 90%, transparent);
  color: rgba(255, 255, 255, 0.88);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease;
}

.lothric-lang-picker__option:hover {
  border-color: color-mix(in srgb, var(--lothric-edit) 45%, transparent);
  background: color-mix(in srgb, var(--lothric-surface-elevated) 85%, transparent);
}

.lothric-lang-picker__option--active {
  border-color: var(--lothric-edit);
  background: color-mix(in srgb, var(--lothric-edit) 12%, var(--lothric-surface-elevated));
  transform: translateY(-1px);
}

.lothric-lang-picker__glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: color-mix(in srgb, var(--lothric-primary) 55%, transparent);
  color: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
}

.lothric-lang-picker__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.lothric-lang-picker__label {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.3;
}

.lothric-lang-picker__desc {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.35;
}

.lothric-lang-picker__check {
  color: var(--lothric-edit);
  flex-shrink: 0;
}

.lothric-preset-card {
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.lothric-preset-card--active {
  border-color: var(--lothric-edit) !important;
  transform: translateY(-2px);
}

.lothric-preset-card__swatches {
  display: flex;
  height: 48px;
}

.lothric-preset-card__swatches span {
  flex: 1;
}

.lothric-color-row {
  display: grid;
  grid-template-columns: 160px 40px 1fr;
  align-items: center;
  gap: 12px;
}

.lothric-color-row__label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
}

.lothric-color-row__picker {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--lothric-border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.lothric-color-row__picker--text {
  cursor: default;
}

.lothric-color-row__hex {
  max-width: 240px;
}

@media (max-width: 600px) {
  .lothric-color-row {
    grid-template-columns: 1fr 40px;
  }

  .lothric-color-row__label {
    grid-column: 1 / -1;
  }

  .lothric-color-row__hex {
    max-width: none;
    grid-column: 1 / -1;
  }
}
</style>
