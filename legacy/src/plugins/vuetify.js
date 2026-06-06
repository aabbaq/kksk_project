import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

const opts = {
  theme: {
    themes: {
      light: {
        primary: '#2D0425'
      },
      dark: {
        primary: '#2D0425'
      }
    }
  }
}

export default new Vuetify(opts)
