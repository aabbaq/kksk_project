import client from './client'

export async function login (username: string, password: string) {
  const { data } = await client.post('/user/login', { username, password })
  return data
}

export async function register (username: string, password: string, nickname?: string, inviteCode?: string) {
  const { data } = await client.post('/user/register', { username, password, nickname, inviteCode })
  return data
}

export async function tokenCheck () {
  const { status } = await client.post('/user/token-check')
  return status
}

export async function getUserInfo () {
  const { data } = await client.get('/user/me')
  return data
}

export async function updateProfile (payload: {
  nickname?: string
  biography?: string
  alias?: string
  emoji?: string
}) {
  const { data } = await client.patch('/user/profile', payload)
  return data
}

export async function changePassword (currentPassword: string, newPassword: string) {
  const { data } = await client.patch('/user/password', { currentPassword, newPassword })
  return data
}

export async function adminListUsers () {
  const { data } = await client.get('/user/admin/list')
  return data
}

export async function adminUpdateUserRole (userId: string, role: number) {
  const { data } = await client.patch(`/user/admin/${userId}/role`, { role })
  return data
}

export async function adminGetUserQuotas (userId: string) {
  const { data } = await client.get(`/user/admin/${userId}/quotas`)
  return data
}

export async function adminUpdateUserQuotas (userId: string, quotas: {
  maxArticles: number
  maxDrafts: number
  maxCoverImages: number
}) {
  const { data } = await client.patch(`/user/admin/${userId}/quotas`, quotas)
  return data
}

export async function adminListInvites () {
  const { data } = await client.get('/user/admin/invites')
  return data
}

export async function adminCreateInvite (payload: {
  maxUses?: number
  expiresInDays?: number
  note?: string
}) {
  const { data } = await client.post('/user/admin/invites', payload)
  return data
}

export async function adminDeleteInvite (code: string) {
  const { data } = await client.delete(`/user/admin/invites/${code}`)
  return data
}
