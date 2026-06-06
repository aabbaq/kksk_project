<script setup lang="ts">
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppearanceStore } from '@/stores/appearance'
import {
  COLOR_LABELS,
  THEME_PRESETS,
  type AppearanceColors,
  type ThemePresetId
} from '@/constants/themePresets'

const appearance = useAppearanceStore()
const { presetId, colors } = storeToRefs(appearance)

const presetList = Object.entries(THEME_PRESETS) as Array<[ThemePresetId, typeof THEME_PRESETS[ThemePresetId]]>

const draft = reactive<AppearanceColors>({ ...colors.value })
const draftPreset = reactive({ id: presetId.value })

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
    <h2 class="text-h5 font-weight-medium mb-2">Blog Appearance</h2>
    <p class="text-body-medium text-medium-emphasis mb-6">
      Choose a preset or customize each surface color. Settings are saved in local storage.
    </p>

    <section class="lothric-panel mb-6">
      <h3 class="text-subtitle-1 font-weight-medium mb-4">Color presets</h3>
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
      <h3 class="text-subtitle-1 font-weight-medium mb-4">Custom colors</h3>
      <div class="lothric-stack">
        <div
          v-for="(label, key) in COLOR_LABELS"
          :key="key"
          class="lothric-color-row"
        >
          <label class="lothric-color-row__label">{{ label }}</label>
          <input
            v-if="hexKeys.includes(key as keyof AppearanceColors)"
            type="color"
            class="lothric-color-row__picker"
            :value="toHexColor(draft[key as keyof AppearanceColors])"
            @input="onColorInput(key as keyof AppearanceColors, ($event.target as HTMLInputElement).value)"
          >
          <span v-else class="lothric-color-row__picker lothric-color-row__picker--text" />
          <v-text-field
            :model-value="draft[key as keyof AppearanceColors]"
            density="compact"
            variant="underlined"
            hide-details
            class="lothric-color-row__hex"
            @update:model-value="onColorInput(key as keyof AppearanceColors, String($event ?? ''))"
          />
        </div>
      </div>
    </section>

    <div class="d-flex flex-wrap ga-3">
      <v-btn variant="text" class="lothric-btn-blend" @click="saveSettings">
        Save settings
      </v-btn>
      <v-btn variant="text" class="lothric-btn-blend" @click="resetDraft">
        Reset to preset
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
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
