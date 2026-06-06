import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SessionUser {
  name: string
  nickname: string
  role: number
  isLogin: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const authorization = ref('')
  const userName = ref('')
  const userNickname = ref('')
  const userRole = ref(0)
  const haveCheckUserToken = ref(false)

  const isLoggedIn = computed(() => haveCheckUserToken.value)

  function changeLogin (payload: {
    token: string
    username: string
    nickname?: string
    userrole: number
  }) {
    authorization.value = payload.token
    userName.value = payload.username
    userNickname.value = payload.nickname ?? payload.username
    userRole.value = payload.userrole
    sessionStorage.setItem('session_authorization', payload.token)
    sessionStorage.setItem('session_user', JSON.stringify({
      name: payload.username,
      nickname: payload.nickname ?? payload.username,
      role: payload.userrole,
      isLogin: true
    }))
  }

  function setNickname (nickname: string) {
    userNickname.value = nickname
    const raw = sessionStorage.getItem('session_user')
    if (!raw) return
    const user = JSON.parse(raw) as SessionUser
    user.nickname = nickname
    sessionStorage.setItem('session_user', JSON.stringify(user))
  }

  function haveCheckUserTokenCommit () {
    if (!authorization.value) {
      authorization.value = sessionStorage.getItem('session_authorization') ?? ''
      const raw = sessionStorage.getItem('session_user')
      if (raw) {
        const user = JSON.parse(raw) as SessionUser
        userName.value = user.name
        userNickname.value = user.nickname ?? user.name
        userRole.value = user.role
      }
    }
    haveCheckUserToken.value = true
  }

  function changeLogout () {
    haveCheckUserToken.value = false
    authorization.value = ''
    userName.value = ''
    userNickname.value = ''
    userRole.value = 0
    sessionStorage.clear()
  }

  return {
    authorization,
    userName,
    userNickname,
    userRole,
    setNickname,
    haveCheckUserToken,
    isLoggedIn,
    changeLogin,
    haveCheckUserTokenCommit,
    changeLogout
  }
})
