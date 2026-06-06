import { UserModel } from '../../models/user.model.js'
import { hashPassword, upgradePasswordIfLegacy, verifyPassword } from '../../utils/hash.js'
import { encryptToken } from '../../utils/token.js'
import { dateToString } from '../../utils/response.js'

function toUserInfo (doc: InstanceType<typeof UserModel>, token?: string) {
  return {
    id: doc._id.toString(),
    username: doc.username,
    nickname: doc.nickname ?? doc.username,
    userrole: doc.userrole ?? 1,
    biography: doc.biography ?? '',
    alias: doc.alias ?? '',
    emoji: doc.emoji ?? '',
    ...(token ? { token } : {})
  }
}

export async function registerUser (username: string, password: string, nickname?: string) {
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
  return { userInfo: toUserInfo(user) }
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
