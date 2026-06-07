import path from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '../../config/env.js'
import type { StorageProvider, StorageUploadResult } from './types.js'

function buildPublicUrl (key: string) {
  const base = env.storage.s3.publicBaseUrl.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  const endpoint = env.storage.s3.endpoint.replace(/\/$/, '')
  if (endpoint) return `${endpoint}/${env.storage.s3.bucket}/${key}`
  return `https://${env.storage.s3.bucket}.s3.${env.storage.s3.region}.amazonaws.com/${key}`
}

let client: S3Client | undefined

function getS3Client (): S3Client {
  if (!client) {
    const region = env.storage.s3.region
    if (!region) {
      throw new Error('S3_REGION is required when object storage is enabled')
    }
    client = new S3Client({
      region,
      endpoint: env.storage.s3.endpoint || undefined,
      forcePathStyle: env.storage.s3.forcePathStyle,
      credentials: {
        accessKeyId: env.storage.s3.accessKeyId,
        secretAccessKey: env.storage.s3.secretAccessKey
      }
    })
  }
  return client
}

export const s3StorageProvider: StorageProvider = {
  async upload (file) {
    const ext = path.extname(file.originalname) || '.jpg'
    const key = `${env.storage.s3.keyPrefix.replace(/\/?$/, '/')}${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

    await getS3Client().send(new PutObjectCommand({
      Bucket: env.storage.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    }))

    const url = buildPublicUrl(key)
    return {
      picture: url,
      url,
      driver: 's3'
    }
  }
}
