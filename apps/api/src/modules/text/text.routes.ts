import { Router } from 'express'
import { optionalAuth, requireAuth } from '../../middleware/auth.js'
import * as controller from './text.controller.js'

import type { Router as RouterType } from 'express'

const router: RouterType = Router()

router.post('/list', optionalAuth, controller.list)
router.get('/one', optionalAuth, controller.getOne)
router.post('/upload', requireAuth, controller.upload)
router.post('/:id/verify-password', optionalAuth, controller.verifyPassword)
router.delete('/:id', requireAuth, controller.remove)

export default router
