import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAppearanceStore } from './stores/appearance'
import { useLocaleStore } from './stores/locale'
import './styles/theme.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)
useAppearanceStore(pinia).load()
useLocaleStore(pinia).load()
app.mount('#app')
