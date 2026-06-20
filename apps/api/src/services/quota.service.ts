import { TextModel } from '../models/text.model.js'
import { CoverUploadModel } from '../models/cover-upload.model.js'
import { UserModel } from '../models/user.model.js'
import { getSiteSettings } from '../modules/settings/settings.service.js'

export interface QuotaLimits {
  maxArticles: number
  maxDrafts: number
  maxCoverImages: number
}

export interface QuotaUsage {
  articles: number
  drafts: number
  coverImages: number
}

export interface QuotaSnapshot {
  limits: QuotaLimits
  usage: QuotaUsage
}

const UNLIMITED: QuotaLimits = {
  maxArticles: -1,
  maxDrafts: -1,
  maxCoverImages: -1
}

function resolveDefaultQuotas (settings: Awaited<ReturnType<typeof getSiteSettings>>): QuotaLimits {
  const q = settings.defaultQuotas
  return {
    maxArticles: q?.maxArticles ?? 10,
    maxDrafts: q?.maxDrafts ?? 5,
    maxCoverImages: q?.maxCoverImages ?? 20
  }
}

export async function getQuotaLimits (userId: string, userrole = 1): Promise<QuotaLimits> {
  if (userrole === 7) return { ...UNLIMITED }

  const [user, settings] = await Promise.all([
    UserModel.findById(userId),
    getSiteSettings()
  ])
  const defaults = resolveDefaultQuotas(settings)
  const custom = user?.quotas

  return {
    maxArticles: custom?.maxArticles ?? defaults.maxArticles,
    maxDrafts: custom?.maxDrafts ?? defaults.maxDrafts,
    maxCoverImages: custom?.maxCoverImages ?? defaults.maxCoverImages
  }
}

export async function getQuotaUsage (userId: string): Promise<QuotaUsage> {
  const [articles, drafts, coverImages] = await Promise.all([
    TextModel.countDocuments({ owner: userId, isDraft: { $ne: true } }),
    TextModel.countDocuments({ owner: userId, isDraft: true }),
    CoverUploadModel.countDocuments({ userId })
  ])
  return { articles, drafts, coverImages }
}

export async function getQuotaSnapshot (userId: string, userrole = 1): Promise<QuotaSnapshot> {
  const [limits, usage] = await Promise.all([
    getQuotaLimits(userId, userrole),
    getQuotaUsage(userId)
  ])
  return { limits, usage }
}

function isExceeded (used: number, max: number): boolean {
  return max !== -1 && used >= max
}

export async function assertArticleQuota (userId: string, userrole = 1) {
  const { limits, usage } = await getQuotaSnapshot(userId, userrole)
  if (isExceeded(usage.articles, limits.maxArticles)) return { error: 113 as const }
  return { ok: true as const }
}

export async function assertDraftQuota (userId: string, userrole = 1) {
  const { limits, usage } = await getQuotaSnapshot(userId, userrole)
  if (isExceeded(usage.drafts, limits.maxDrafts)) return { error: 113 as const }
  return { ok: true as const }
}

export async function assertCoverImageQuota (userId: string, userrole = 1) {
  const { limits, usage } = await getQuotaSnapshot(userId, userrole)
  if (isExceeded(usage.coverImages, limits.maxCoverImages)) return { error: 113 as const }
  return { ok: true as const }
}

export async function recordCoverUpload (userId: string, url: string) {
  await CoverUploadModel.create({ userId, url })
}
