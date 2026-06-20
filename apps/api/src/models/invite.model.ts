import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const inviteSchema = new Schema({
  code: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  maxUses: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'invites'
})

export type InviteDocument = InferSchemaType<typeof inviteSchema> & {
  _id: mongoose.Types.ObjectId
}

export const InviteModel = mongoose.model('invite', inviteSchema)
