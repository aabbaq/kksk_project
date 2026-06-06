export type ThemePresetId = 'black' | 'purple' | 'brown' | 'blue'

export interface AppearanceColors {
  articleBg: string
  topbarBg: string
  footbarBg: string
  tabsBg: string
  buttonBg: string
}

export interface AppearanceSettings {
  presetId: ThemePresetId
  colors: AppearanceColors
}

export const STORAGE_KEY = 'lothric_appearance'

export const COLOR_LABELS: Record<keyof AppearanceColors, string> = {
  articleBg: 'Article background',
  topbarBg: 'Top bar background',
  footbarBg: 'Footer background',
  tabsBg: 'Tabs background',
  buttonBg: 'Button background'
}

export const THEME_PRESETS: Record<ThemePresetId, { label: string; colors: AppearanceColors }> = {
  purple: {
    label: 'Purple (current)',
    colors: {
      articleBg: '#2a0f24',
      topbarBg: '#2d0425',
      footbarBg: '#2d0425',
      tabsBg: '#3f1235',
      buttonBg: 'rgba(255, 255, 255, 0.06)'
    }
  },
  black: {
    label: 'Black',
    colors: {
      articleBg: '#1a1a1a',
      topbarBg: '#0a0a0a',
      footbarBg: '#0a0a0a',
      tabsBg: '#141414',
      buttonBg: 'rgba(255, 255, 255, 0.08)'
    }
  },
  brown: {
    label: 'Brown',
    colors: {
      articleBg: '#352015',
      topbarBg: '#2a1810',
      footbarBg: '#2a1810',
      tabsBg: '#3d2418',
      buttonBg: 'rgba(255, 220, 180, 0.08)'
    }
  },
  blue: {
    label: 'Deep blue',
    colors: {
      articleBg: '#101e35',
      topbarBg: '#0a1628',
      footbarBg: '#0a1628',
      tabsBg: '#122040',
      buttonBg: 'rgba(140, 180, 255, 0.1)'
    }
  }
}

export function getDefaultSettings (): AppearanceSettings {
  return {
    presetId: 'purple',
    colors: { ...THEME_PRESETS.purple.colors }
  }
}
