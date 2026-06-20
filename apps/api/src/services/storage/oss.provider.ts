import path from 'node:path'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../../config/env.js'
import type { StorageProvider, StorageUploadResult } from './types.js'
import { getOssClient } from './oss.client.js'
import { resolveOssPictureUrl } from './oss-url.js'

function buildCanonicalUrl (key: string) {
  const base = env.storage.oss.publicBaseUrl.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  const endpoint = env.storage.oss.endpoint.replace(/\/$/, '')
  if (endpoint) return `${endpoint}/${env.storage.oss.bucket}/${key}`
  return `https://${env.storage.oss.bucket}.${env.storage.oss.region}.aliyuncs.com/${key}`
}

export const ossStorageProvider: StorageProvider = {
  async upload (file) {
    const ext = path.extname(file.originalname) || '.jpg'
    const key = `${env.storage.oss.keyPrefix.replace(/\/?$/, '/')}${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

    await getOssClient().send(new PutObjectCommand({
      Bucket: env.storage.oss.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }))

    const canonicalUrl = buildCanonicalUrl(key)
    const previewUrl = await resolveOssPictureUrl(canonicalUrl, 0)
    return {
      picture: canonicalUrl,
      url: previewUrl,
      driver: 'oss'
    }
  }
}
