import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const blogTextInfoSchema = new Schema({
  number: Number,
  author: String,
  owner: String,
  date: Date,
  dateInString: String,
  lastDate: Date,
  lastDateInString: String,
  title: String,
  subtitle: String,
  tag: String,
  picture: String,
  content: String,
  htmlContent: String,
  secretLevel: { type: Number, default: 0 },
  protected: { type: Boolean, default: false },
  protectedPassword: String,
  hidden: { type: Boolean, default: false },
  isDraft: { type: Boolean, default: false }
})

export type TextDocument = InferSchemaType<typeof blogTextInfoSchema> & {
  _id: mongoose.Types.ObjectId
}

export const TextModel = mongoose.model('text', blogTextInfoSchema)
