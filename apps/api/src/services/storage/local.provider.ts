import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { StorageProvider, StorageUploadResult } from './types.js'
import { env } from '../../config/env.js'

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const uploadPath = path.resolve(apiRoot, env.uploadDir)

fs.mkdirSync(uploadPath, { recursive: true })

export const localStorageProvider: StorageProvider = {
  async upload (file) {
    const ext = path.extname(file.originalname) || '.jpg'
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    const target = path.join(uploadPath, filename)
    await fs.promises.writeFile(target, file.buffer)

    const picture = filename.replace(path.extname(filename), '')
    return {
      picture,
      url: `/uploads/${filename}`,
      driver: 'local'
    }
  }
}
