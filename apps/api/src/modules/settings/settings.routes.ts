import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { requireAdmin } from '../../middleware/admin.js'
import * as controller from './settings.controller.js'

import type { Router as RouterType } from 'express'

const router: RouterType = Router()

router.get('/', controller.getSettings)
router.patch('/', requireAuth, requireAdmin, controller.updateSettings)

export default router
