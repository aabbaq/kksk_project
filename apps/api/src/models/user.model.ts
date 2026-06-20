import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userInfoSchema = new Schema({
  username: { type: String, required: true, unique: true },
  nickname: String,
  password: { type: String, required: true },
  userrole: { type: Number, default: 1 },
  registerDate: Date,
  registerDateInString: String,
  lastLoginDate: Date,
  lastLoginDateInString: String,
  biography: String,
  alias: String,
  emoji: String,
  quotas: {
    maxArticles: Number,
    maxDrafts: Number,
    maxCoverImages: Number
  }
})

export type UserDocument = InferSchemaType<typeof userInfoSchema> & {
  _id: mongoose.Types.ObjectId
}

export const UserModel = mongoose.model('user', userInfoSchema)
