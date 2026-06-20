import { S3Client } from '@aws-sdk/client-s3'
import { env } from '../../config/env.js'

let client: S3Client | undefined

export function getOssClient (): S3Client {
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
