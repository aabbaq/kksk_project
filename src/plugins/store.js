import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  Authorization: '',
  UserName: '',
  HaveCheckUserToken: false
}

const mutations = {
  changeLogin (state, userLoginInformation) {
    state.Authorization = userLoginInformation.token
    state.UserName = userLoginInformation.userid
    sessionStorage.setItem('session_authorization', state.Authorization)
    sessionStorage.setItem('session_username', userLoginInformation.userid)
  },
  haveCheckUserToken (state) {
    state.HaveCheckUserToken = true
  }
}

export default new Vuex.Store({
  state,
  mutations
})
