import { UserModel } from '../../models/user.model.js'
import { hashPassword, upgradePasswordIfLegacy, verifyPassword } from '../../utils/hash.js'
import { encryptToken } from '../../utils/token.js'
import { dateToString } from '../../utils/response.js'
import { getQuotaSnapshot } from '../../services/quota.service.js'
import { consumeInviteCode, isInviteRequired } from '../../services/invite.service.js'

function toUserInfo (doc: InstanceType<typeof UserModel>, token?: string, quotas?: Awaited<ReturnType<typeof getQuotaSnapshot>>) {
  return {
    id: doc._id.toString(),
    username: doc.username,
    nickname: doc.nickname ?? doc.username,
    userrole: doc.userrole ?? 1,
    biography: doc.biography ?? '',
    alias: doc.alias ?? '',
    emoji: doc.emoji ?? '',
    ...(quotas ? { quotas } : {}),
    ...(token ? { token } : {})
  }
}

export async function registerUser (
  username: string,
  password: string,
  nickname?: string,
  inviteCode?: string
) {
  const inviteRequired = await isInviteRequired()
  if (inviteRequired) {
    if (!inviteCode?.trim()) return { error: 111 as const }
    const inviteResult = await consumeInviteCode(inviteCode)
    if ('error' in inviteResult) return { error: inviteResult.error }
  } else if (inviteCode?.trim()) {
    const inviteResult = await consumeInviteCode(inviteCode)
    if ('error' in inviteResult) return { error: inviteResult.error }
  }

  const exists = await UserModel.findOne({ username })
  if (exists) return { error: 109 as const }

  const now = new Date()
  const hashed = await hashPassword(password)
  const user = await UserModel.create({
    username,
    nickname: nickname ?? username,
    password: hashed,
    userrole: 1,
    registerDate: now,
    registerDateInString: dateToString(now, true),
    lastLoginDate: now,
    lastLoginDateInString: dateToString(now, true),
    biography: '',
    alias: '',
    emoji: ''
  })

  const token = encryptToken({ id: user._id.toString(), userrole: user.userrole ?? 1 })
  return { userInfo: toUserInfo(user, token) }
}

export async function loginUser (username: string, password: string) {
  const user = await UserModel.findOne({ username })
  if (!user) return { error: 102 as const }

  const valid = await verifyPassword(password, user.password)
  if (!valid) return { error: 102 as const }

  const upgraded = await upgradePasswordIfLegacy(password, user.password)
  if (upgraded) {
    user.password = upgraded
    user.lastLoginDate = new Date()
    user.lastLoginDateInString = dateToString(user.lastLoginDate, true)
    await user.save()
  } else {
    user.lastLoginDate = new Date()
    user.lastLoginDateInString = dateToString(user.lastLoginDate, true)
    await user.save()
  }

  const token = encryptToken({ id: user._id.toString(), userrole: user.userrole ?? 1 })
  return { userInfo: toUserInfo(user, token) }
}

export async function getUserById (id: string) {
  const user = await UserModel.findById(id)
  if (!user) return { error: 101 as const }
  const quotas = await getQuotaSnapshot(id, user.userrole ?? 1)
  return { userInfo: toUserInfo(user, undefined, quotas) }
}

export async function updateProfile (id: string, data: {
  nickname?: string
  biography?: string
  alias?: string
  emoji?: string
}) {
  const user = await UserModel.findByIdAndUpdate(id, data, { new: true })
  if (!user) return { error: 101 as const }
  return { userInfo: toUserInfo(user) }
}

export async function changePassword (id: string, currentPassword: string, newPassword: string) {
  const user = await UserModel.findById(id)
  if (!user) return { error: 101 as const }

  const valid = await verifyPassword(currentPassword, user.password)
  if (!valid) return { error: 102 as const }

  user.password = await hashPassword(newPassword)
  await user.save()
  return { ok: true }
}

export async function listAllUsers () {
  const users = await UserModel.find({}, { password: 0 }).sort({ registerDate: -1 })
  return users.map(u => ({
    id: u._id.toString(),
    username: u.username,
    nickname: u.nickname ?? u.username,
    userrole: u.userrole ?? 1,
    biography: u.biography ?? '',
    alias: u.alias ?? '',
    emoji: u.emoji ?? '',
    registerDateInString: u.registerDateInString ?? ''
  }))
}

export async function setUserRole (id: string, role: number) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { userrole: role },
    { new: true }
  )
  if (!user) return { error: 101 as const }
  return { userInfo: toUserInfo(user) }
}

export async function getUserQuotasAdmin (id: string) {
  const user = await UserModel.findById(id)
  if (!user) return { error: 101 as const }
  const quotas = await getQuotaSnapshot(id, user.userrole ?? 1)
  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      nickname: user.nickname ?? user.username,
      userrole: user.userrole ?? 1
    },
    quotas,
    overrides: {
      maxArticles: user.quotas?.maxArticles ?? null,
      maxDrafts: user.quotas?.maxDrafts ?? null,
      maxCoverImages: user.quotas?.maxCoverImages ?? null
    }
  }
}

export async function setUserQuotas (
  id: string,
  data: { maxArticles: number, maxDrafts: number, maxCoverImages: number }
) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    { quotas: data },
    { new: true }
  )
  if (!user) return { error: 101 as const }
  const quotas = await getQuotaSnapshot(id, user.userrole ?? 1)
  return { quotas }
}
