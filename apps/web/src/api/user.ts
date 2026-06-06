import client from './client'

export async function login (username: string, password: string) {
  const { data } = await client.post('/user/login', { username, password })
  return data
}

export async function register (username: string, password: string, nickname?: string) {
  const { data } = await client.post('/user/register', { username, password, nickname })
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
