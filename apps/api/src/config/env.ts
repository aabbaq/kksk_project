import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const nodeEnv = process.env.NODE_ENV ?? 'development'
const ossBucket = process.env.OSS_BUCKET ?? ''
const ossAccessKey = process.env.OSS_ACCESS_KEY_ID ?? ''
const ossSecretKey = process.env.OSS_SECRET_ACCESS_KEY ?? ''

export function isOssConfigured () {
  return Boolean(ossBucket && ossAccessKey && ossSecretKey)
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
      || (nodeEnv === 'production' && isOssConfigured()),
    oss: {
      bucket: ossBucket,
      region: process.env.OSS_REGION || 'oss-cn-beijing',
      endpoint: process.env.OSS_ENDPOINT ?? '',
      accessKeyId: ossAccessKey,
      secretAccessKey: ossSecretKey,
      publicBaseUrl: process.env.OSS_PUBLIC_BASE_URL ?? '',
      keyPrefix: process.env.OSS_KEY_PREFIX ?? 'uploads/',
      forcePathStyle: process.env.OSS_FORCE_PATH_STYLE === 'true'
    }
  }
}
