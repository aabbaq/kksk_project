import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const siteSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: 'global' },
  imageStorageObjectStore: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'site_settings'
})

export type SiteSettingsDocument = InferSchemaType<typeof siteSettingsSchema> & {
  _id: mongoose.Types.ObjectId
}

export const SiteSettingsModel = mongoose.model('site_settings', siteSettingsSchema)
