import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SessionUser {
  name: string
  role: number
  isLogin: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const authorization = ref('')
  const userName = ref('')
  const userRole = ref(0)
  const haveCheckUserToken = ref(false)

  const isLoggedIn = computed(() => haveCheckUserToken.value)

  function changeLogin (payload: {
    token: string
    username: string
    userrole: number
  }) {
    authorization.value = payload.token
    userName.value = payload.username
    userRole.value = payload.userrole
    sessionStorage.setItem('session_authorization', payload.token)
    sessionStorage.setItem('session_user', JSON.stringify({
      name: payload.username,
      role: payload.userrole,
      isLogin: true
    }))
  }

  function haveCheckUserTokenCommit () {
    if (!authorization.value) {
      authorization.value = sessionStorage.getItem('session_authorization') ?? ''
      const raw = sessionStorage.getItem('session_user')
      if (raw) {
        const user = JSON.parse(raw) as SessionUser
        userName.value = user.name
        userRole.value = user.role
      }
    }
    haveCheckUserToken.value = true
  }

  function changeLogout () {
    haveCheckUserToken.value = false
    authorization.value = ''
    userName.value = ''
    userRole.value = 0
    sessionStorage.clear()
  }

  return {
    authorization,
    userName,
    userRole,
    haveCheckUserToken,
    isLoggedIn,
    changeLogin,
    haveCheckUserTokenCommit,
    changeLogout
  }
})
