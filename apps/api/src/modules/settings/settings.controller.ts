import type { Response } from 'express'
import { updateSettingsSchema } from '@kksk/shared'
import type { AuthRequest } from '../../middleware/auth.js'
import { sendError, sendSuccess } from '../../utils/response.js'
import { getEffectiveStorageDriver, getStorageCapabilities } from '../../services/storage/index.js'
import * as settingsService from './settings.service.js'

export async function getSettings (_req: AuthRequest, res: Response) {
  const settings = await settingsService.getSiteSettings()
  const capabilities = getStorageCapabilities()
  const effectiveDriver = await getEffectiveStorageDriver()

  sendSuccess(res, {
    imageStorageObjectStore: settings.imageStorageObjectStore,
    effectiveDriver,
    capabilities
  })
}

export async function updateSettings (req: AuthRequest, res: Response) {
  const parsed = updateSettingsSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }

  const capabilities = getStorageCapabilities()
  if (parsed.data.imageStorageObjectStore && !capabilities.objectStore) {
    sendError(res, 102, 400)
    return
  }

  const settings = await settingsService.updateSiteSettings(parsed.data)
  const effectiveDriver = await getEffectiveStorageDriver()

  sendSuccess(res, {
    imageStorageObjectStore: settings.imageStorageObjectStore,
    effectiveDriver,
    capabilities
  })
}
