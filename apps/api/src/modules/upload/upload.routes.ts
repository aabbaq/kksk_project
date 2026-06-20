import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../../middleware/auth.js'
import { sendSuccess } from '../../utils/response.js'
import { getStorageProvider } from '../../services/storage/index.js'

import type { Router as RouterType } from 'express'

interface MulterError extends Error {
  code?: string
}

const MAX_IMAGE_SIZE_MB = 10
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files allowed'))
      return
    }
    cb(null, true)
  }
})

const router: RouterType = Router()

router.post('/image', requireAuth, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
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
      filename: result.picture // backward compat
    })
  } catch (err) {
    next(err)
  }
})

// BUG-4/7 fix: catch multer errors (size limit, invalid type) and return proper status
router.use('/image', (err: MulterError, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ status: 413, msg: `File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.` })
    return
  }
  if (err?.message === 'Only image files allowed') {
    res.status(400).json({ status: 400, msg: 'Invalid file type. Only image files are accepted.' })
    return
  }
  res.status(500).json({ status: 500, msg: 'Upload failed.' })
})

export default router
