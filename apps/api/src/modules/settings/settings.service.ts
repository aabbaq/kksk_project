import { SiteSettingsModel } from '../../models/settings.model.js'
import { env } from '../../config/env.js'

const SETTINGS_KEY = 'global'

export async function getSiteSettings () {
  let doc = await SiteSettingsModel.findOne({ key: SETTINGS_KEY })
  if (!doc) {
    doc = await SiteSettingsModel.create({
      key: SETTINGS_KEY,
      imageStorageObjectStore: env.storage.defaultObjectStore
    })
  }
  return doc
}

export async function updateSiteSettings (data: { imageStorageObjectStore: boolean }) {
  const doc = await SiteSettingsModel.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { imageStorageObjectStore: data.imageStorageObjectStore },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  return doc!
}
