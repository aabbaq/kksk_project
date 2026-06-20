import type { Express } from 'express'
import type { Application } from 'express'
import request from 'supertest'
import { createApp } from '../../apps/api/src/app.js'
import { hashPassword } from '../../apps/api/src/utils/hash.js'
import { encryptToken } from '../../apps/api/src/utils/token.js'
import { UserModel } from '../../apps/api/src/models/user.model.js'
import { SiteSettingsModel } from '../../apps/api/src/models/settings.model.js'

let cachedApp: Express | undefined

export function getApp (): Application {
  if (!cachedApp) cachedApp = createApp()
  return cachedApp as Application
}

export function bearer (token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function seedUser (opts: {
  username: string
  password: string
  userrole?: number
  nickname?: string
  quotas?: { maxArticles: number, maxDrafts: number, maxCoverImages: number }
}) {
  const password = await hashPassword(opts.password)
  const user = await UserModel.create({
    username: opts.username,
    nickname: opts.nickname ?? opts.username,
    password,
    userrole: opts.userrole ?? 1,
    registerDate: new Date(),
    registerDateInString: '2026/1/1',
    lastLoginDate: new Date(),
    lastLoginDateInString: '2026/1/1',
    ...(opts.quotas ? { quotas: opts.quotas } : {})
  })
  const token = encryptToken({ id: user._id.toString(), userrole: user.userrole ?? 1 })
  return { user, token }
}

export async function seedSiteSettings (overrides?: {
  requireInviteCode?: boolean
  defaultQuotas?: { maxArticles: number, maxDrafts: number, maxCoverImages: number }
}) {
  return SiteSettingsModel.findOneAndUpdate(
    { key: 'global' },
    {
      key: 'global',
      imageStorageObjectStore: false,
      requireInviteCode: overrides?.requireInviteCode ?? false,
      defaultQuotas: overrides?.defaultQuotas ?? {
        maxArticles: 10,
        maxDrafts: 5,
        maxCoverImages: 20
      }
    },
    { upsert: true, new: true }
  )
}

export async function registerViaApi (
  app: Application,
  body: { username: string, password: string, nickname?: string, inviteCode?: string }
) {
  return request(app).post('/api/user/register').send(body)
}

export async function loginViaApi (
  app: Application,
  username: string,
  password: string
) {
  return request(app).post('/api/user/login').send({ username, password })
}
