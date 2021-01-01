import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  Authorization: '',
  UserInfo: {
    UserName: '',
    Role: ''
  },
  HaveCheckUserToken: false
}

const mutations = {
  changeLogin (state, userLoginInformation) {
    state.Authorization = userLoginInformation.token
    state.UserInfo.UserName = userLoginInformation.username
    state.UserInfo.Role = userLoginInformation.userrole
    const user = {
      name: userLoginInformation.username,
      role: userLoginInformation.userrole,
      isLogin: true
    }
    sessionStorage.setItem('session_authorization', state.Authorization)
    sessionStorage.setItem('session_user', JSON.stringify(user))
  },
  haveCheckUserToken (state) {
    state.HaveCheckUserToken = true
  },
  changeLogout (state) {
    state.HaveCheckUserToken = false
    state.Authorization = ''
    state.UserInfo.UserName = ''
    state.UserInfo.Role = ''
  }
}

export default new Vuex.Store({
  state,
  mutations
})
