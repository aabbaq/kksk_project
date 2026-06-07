import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const nodeEnv = process.env.NODE_ENV ?? 'development'
const s3Bucket = process.env.S3_BUCKET ?? ''
const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? ''
const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? ''

export function isS3Configured () {
  return Boolean(s3Bucket && s3AccessKey && s3SecretKey)
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development' || nodeEnv === 'test',
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/blog',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '3h',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  storage: {
    /** Default for new installs when no DB settings exist yet */
    defaultObjectStore: process.env.STORAGE_USE_OBJECT_STORE === 'true'
      || (nodeEnv === 'production' && isS3Configured()),
    s3: {
      bucket: s3Bucket,
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT ?? '',
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
      publicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? '',
      keyPrefix: process.env.S3_KEY_PREFIX ?? 'uploads/',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
    }
  }
}
