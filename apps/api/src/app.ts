import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import userRoutes from './modules/user/user.routes.js'
import textRoutes from './modules/text/text.routes.js'
import uploadRoutes from './modules/upload/upload.routes.js'

import type { Express } from 'express'

export function createApp (): Express {
  const app = express()

  app.use(cors({
    origin: env.corsOrigin,
    credentials: true
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const uploadDir = path.resolve(apiRoot, env.uploadDir)
  fs.mkdirSync(uploadDir, { recursive: true })
  app.use('/uploads', express.static(uploadDir))

  const legacyStatic = path.resolve(apiRoot, '../../static')
  if (fs.existsSync(legacyStatic)) {
    app.use('/static', express.static(legacyStatic))
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 200, ok: true })
  })

  app.use('/api/user', userRoutes)
  app.use('/api/text', textRoutes)
  app.use('/api/upload', uploadRoutes)

  app.use(errorHandler)
  return app
}
