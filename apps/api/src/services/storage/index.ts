import { env, isOssConfigured } from '../../config/env.js'
import { getSiteSettings } from '../../modules/settings/settings.service.js'
import { localStorageProvider } from './local.provider.js'
import { ossStorageProvider } from './oss.provider.js'
import type { StorageDriver, StorageProvider } from './types.js'

export async function getEffectiveStorageDriver (): Promise<StorageDriver> {
  const settings = await getSiteSettings()
  if (settings.imageStorageObjectStore && isOssConfigured()) return 'oss'
  return 'local'
}

export async function getStorageProvider (): Promise<StorageProvider> {
  const driver = await getEffectiveStorageDriver()
  return driver === 'oss' ? ossStorageProvider : localStorageProvider
}

export function getStorageCapabilities () {
  return {
    local: true,
    objectStore: isOssConfigured(),
    environment: env.nodeEnv,
    defaultObjectStore: env.storage.defaultObjectStore
  }
}
