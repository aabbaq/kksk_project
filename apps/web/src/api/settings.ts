import client from './client'

export interface SiteSettingsResponse {
  status: number
  imageStorageObjectStore: boolean
  effectiveDriver: 'local' | 's3'
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

export async function updateSiteSettings (payload: { imageStorageObjectStore: boolean }) {
  const { data } = await client.patch<SiteSettingsResponse>('/settings', payload)
  return data
}
