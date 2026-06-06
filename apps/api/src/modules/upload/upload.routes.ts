import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../../middleware/auth.js'
import { sendSuccess } from '../../utils/response.js'
import { getStorageProvider } from '../../services/storage/index.js'

import type { Router as RouterType } from 'express'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files allowed'))
      return
    }
    cb(null, true)
  }
})

const router: RouterType = Router()

router.post('/image', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ status: 400, msg: 'No file uploaded' })
      return
    }

    const provider = await getStorageProvider()
    const result = await provider.upload(req.file)

    sendSuccess(res, {
      picture: result.picture,
      url: result.url,
      driver: result.driver,
      // backward compatibility for older clients
      filename: result.picture
    })
  } catch (err) {
    next(err)
  }
})

export default router
