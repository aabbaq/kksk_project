import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SessionUser {
  id?: string
  name: string
  nickname: string
  role: number
  isLogin: boolean
}

function parseJwtPayload (token: string): { id?: string, userrole?: number } | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as { id?: string, userrole?: number }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const authorization = ref('')
  const userId = ref('')
  const userName = ref('')
  const userNickname = ref('')
  const userRole = ref(0)
  const haveCheckUserToken = ref(false)

  const isLoggedIn = computed(() => haveCheckUserToken.value)
  const isAdmin = computed(() => userRole.value === 7)

  function changeLogin (payload: {
    token: string
    id?: string
    username: string
    nickname?: string
    userrole: number
  }) {
    authorization.value = payload.token
    userId.value = payload.id ?? ''
    userName.value = payload.username
    userNickname.value = payload.nickname ?? payload.username
    userRole.value = payload.userrole
    sessionStorage.setItem('session_authorization', payload.token)
    sessionStorage.setItem('session_user', JSON.stringify({
      id: payload.id ?? '',
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
        userId.value = user.id ?? ''
        userName.value = user.name
        userNickname.value = user.nickname ?? user.name
        userRole.value = user.role
      }
    }
    if (!userId.value && authorization.value) {
      const payload = parseJwtPayload(authorization.value)
      if (payload?.id) {
        userId.value = payload.id
        const raw = sessionStorage.getItem('session_user')
        if (raw) {
          const user = JSON.parse(raw) as SessionUser
          user.id = payload.id
          sessionStorage.setItem('session_user', JSON.stringify(user))
        }
      }
    }
    haveCheckUserToken.value = true
  }

  function changeLogout () {
    haveCheckUserToken.value = false
    authorization.value = ''
    userId.value = ''
    userName.value = ''
    userNickname.value = ''
    userRole.value = 0
    sessionStorage.clear()
  }

  return {
    authorization,
    userId,
    userName,
    userNickname,
    userRole,
    setNickname,
    haveCheckUserToken,
    isLoggedIn,
    isAdmin,
    changeLogin,
    haveCheckUserTokenCommit,
    changeLogout
  }
})
