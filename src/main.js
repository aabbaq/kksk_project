import Vue from 'vue'
import App from './App.vue'
import axios from './plugins/axios-filter'
import vuetify from './plugins/vuetify'
import store from './plugins/store'
import router from './plugins/router'

import TopBar from './customcomponents/TopBar'
import FootBar from './customcomponents/FootBar'
import MainPicture from './customcomponents/MainPicture'
import FunctionButton from './customcomponents/FunctionButton'

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.component('top-bar', TopBar)
Vue.component('foot-bar', FootBar)
Vue.component('main-picture', MainPicture)
Vue.component('function-button', FunctionButton)

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
