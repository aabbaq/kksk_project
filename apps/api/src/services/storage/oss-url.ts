import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env, isOssConfigured } from '../../config/env.js'
import { getOssClient } from './oss.client.js'

const OSS_PUBLIC_EXPIRES_SEC = 24 * 60 * 60
const OSS_SECRET_EXPIRES_SEC = 60 * 60

export function isOssPictureUrl (picture?: string): boolean {
  if (!picture || picture === 'default') return false
  if (!picture.startsWith('http://') && !picture.startsWith('https://')) return false

  const base = env.storage.oss.publicBaseUrl.replace(/\/$/, '')
  if (base && picture.startsWith(base)) return true

  const endpoint = env.storage.oss.endpoint.replace(/\/$/, '')
  if (endpoint && picture.startsWith(`${endpoint}/`)) return true

  if (env.storage.oss.bucket) {
    const hostPattern = `${env.storage.oss.bucket}.${env.storage.oss.region}.aliyuncs.com`
    if (picture.includes(hostPattern)) return true
  }

  return false
}

export function extractOssKey (picture: string): string | null {
  try {
    const url = new URL(picture)
    const pathname = url.pathname.replace(/^\//, '')
    if (!pathname) return null

    const endpoint = env.storage.oss.endpoint.replace(/\/$/, '')
    if (endpoint && picture.startsWith(`${endpoint}/`)) {
      const prefix = `${env.storage.oss.bucket}/`
      return pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname
    }

    return pathname
  } catch {
    return null
  }
}

export async function resolveOssPictureUrl (
  picture: string,
  secretLevel = 0
): Promise<string> {
  if (!isOssConfigured() || !isOssPictureUrl(picture)) return picture

  const key = extractOssKey(picture)
  if (!key) return picture

  const expiresIn = secretLevel > 0 ? OSS_SECRET_EXPIRES_SEC : OSS_PUBLIC_EXPIRES_SEC
  const command = new GetObjectCommand({
    Bucket: env.storage.oss.bucket,
    Key: key
  })

  return getSignedUrl(getOssClient(), command, { expiresIn })
}
