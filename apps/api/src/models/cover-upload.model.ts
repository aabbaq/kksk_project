import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const coverUploadSchema = new Schema({
  userId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'cover_uploads'
})

export type CoverUploadDocument = InferSchemaType<typeof coverUploadSchema> & {
  _id: mongoose.Types.ObjectId
}

export const CoverUploadModel = mongoose.model('cover_upload', coverUploadSchema)
