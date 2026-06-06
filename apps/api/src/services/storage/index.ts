import { env, isS3Configured } from '../../config/env.js'
import { getSiteSettings } from '../../modules/settings/settings.service.js'
import { localStorageProvider } from './local.provider.js'
import { s3StorageProvider } from './s3.provider.js'
import type { StorageDriver, StorageProvider } from './types.js'

export async function getEffectiveStorageDriver (): Promise<StorageDriver> {
  const settings = await getSiteSettings()
  if (settings.imageStorageObjectStore && isS3Configured()) return 's3'
  return 'local'
}

export async function getStorageProvider (): Promise<StorageProvider> {
  const driver = await getEffectiveStorageDriver()
  return driver === 's3' ? s3StorageProvider : localStorageProvider
}

export function getStorageCapabilities () {
  return {
    local: true,
    objectStore: isS3Configured(),
    environment: env.nodeEnv,
    defaultObjectStore: env.storage.defaultObjectStore
  }
}
