import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { beforeAll, beforeEach } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uriFile = path.resolve(__dirname, '../../.test-mongo-uri')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long!!'
process.env.JWT_EXPIRES_IN = '3h'
process.env.MONGODB_URI = readFileSync(uriFile, 'utf8').trim()
process.env.CORS_ORIGIN = 'http://localhost:5173'
process.env.STORAGE_USE_OBJECT_STORE = 'false'
process.env.UPLOAD_DIR = 'uploads-test'

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!)
  }
})

beforeEach(async () => {
  const collections = mongoose.connection.collections
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  )
})
