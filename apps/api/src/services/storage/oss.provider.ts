import path from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '../../config/env.js'
import type { StorageProvider, StorageUploadResult } from './types.js'

function buildPublicUrl (key: string) {
  const base = env.storage.oss.publicBaseUrl.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  const endpoint = env.storage.oss.endpoint.replace(/\/$/, '')
  if (endpoint) return `${endpoint}/${env.storage.oss.bucket}/${key}`
  return `https://${env.storage.oss.bucket}.${env.storage.oss.region}.aliyuncs.com/${key}`
}

let client: S3Client | undefined

function getOssClient (): S3Client {
  if (!client) {
    const region = env.storage.oss.region
    if (!region) {
      throw new Error('OSS_REGION is required when object storage is enabled')
    }
    client = new S3Client({
      region,
      endpoint: env.storage.oss.endpoint || undefined,
      forcePathStyle: env.storage.oss.forcePathStyle,
      credentials: {
        accessKeyId: env.storage.oss.accessKeyId,
        secretAccessKey: env.storage.oss.secretAccessKey
      }
    })
  }
  return client
}

export const ossStorageProvider: StorageProvider = {
  async upload (file) {
    const ext = path.extname(file.originalname) || '.jpg'
    const key = `${env.storage.oss.keyPrefix.replace(/\/?$/, '/')}${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

    await getOssClient().send(new PutObjectCommand({
      Bucket: env.storage.oss.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Public URL is returned after upload; object must allow anonymous read.
      ACL: 'public-read'
    }))

    const url = buildPublicUrl(key)
    return {
      picture: url,
      url,
      driver: 'oss'
    }
  }
}
