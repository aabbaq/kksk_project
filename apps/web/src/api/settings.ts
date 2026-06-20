import client from './client'

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

export interface SiteSettingsResponse {
  status: number
  imageStorageObjectStore: boolean
  requireInviteCode: boolean
  defaultQuotas: QuotaLimits
  effectiveDriver: 'local' | 'oss'
  capabilities: {
    local: boolean
    objectStore: boolean
    environment: string
    defaultObjectStore: boolean
  }
}

export async function getSiteSettings () {
  const { data } = await client.get<SiteSettingsResponse>('/settings')
  return data
}

export async function updateSiteSettings (payload: {
  imageStorageObjectStore?: boolean
  requireInviteCode?: boolean
  defaultQuotas?: QuotaLimits
}) {
  const { data } = await client.patch<SiteSettingsResponse>('/settings', payload)
  return data
}
