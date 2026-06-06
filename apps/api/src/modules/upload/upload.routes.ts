import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import multer from 'multer'
import { env } from '../../config/env.js'
import { requireAuth } from '../../middleware/auth.js'
import { sendSuccess } from '../../utils/response.js'

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const uploadPath = path.resolve(apiRoot, env.uploadDir)
fs.mkdirSync(uploadPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files allowed'))
      return
    }
    cb(null, true)
  }
})

import type { Router as RouterType } from 'express'

const router: RouterType = Router()

router.post('/image', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ status: 400, msg: 'No file uploaded' })
    return
  }
  const filename = req.file.filename.replace(path.extname(req.file.filename), '')
  sendSuccess(res, {
    filename,
    url: `/uploads/${req.file.filename}`
  })
})

export default router
