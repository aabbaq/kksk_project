import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#2D0425',
          secondary: '#8CD2BC',
          error: '#FF5234',
          background: '#12040f',
          surface: '#1a0618',
          'surface-bright': '#2a0f24'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      class: 'text-none',
      rounded: 'lg'
    },
    VCard: {
      rounded: 'xl',
      elevation: 2
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VChip: {
      rounded: 'lg',
      size: 'small'
    },
    VContainer: {
      fluid: false
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  }
})
