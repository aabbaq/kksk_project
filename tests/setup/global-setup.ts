import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoMemoryServer } from 'mongodb-memory-server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uriFile = path.resolve(__dirname, '../../.test-mongo-uri')

export default async function globalSetup () {
  const mongo = await MongoMemoryServer.create()
  writeFileSync(uriFile, mongo.getUri(), 'utf8')

  return async () => {
    await mongo.stop()
  }
}
