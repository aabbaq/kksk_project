import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { requireAdmin } from '../../middleware/admin.js'
import * as controller from './user.controller.js'

import type { Router as RouterType } from 'express'

const router: RouterType = Router()

router.post('/register', controller.register)
router.post('/login', controller.login)
router.post('/token-check', requireAuth, controller.tokenCheck)
router.get('/me', requireAuth, controller.getMe)
router.patch('/profile', requireAuth, controller.updateProfile)
router.patch('/password', requireAuth, controller.changePassword)
router.get('/admin/list', requireAuth, requireAdmin, controller.listUsers)
router.get('/admin/invites', requireAuth, requireAdmin, controller.listInvites)
router.post('/admin/invites', requireAuth, requireAdmin, controller.createInvite)
router.delete('/admin/invites/:code', requireAuth, requireAdmin, controller.removeInvite)
router.get('/admin/:id/quotas', requireAuth, requireAdmin, controller.getUserQuotas)
router.patch('/admin/:id/quotas', requireAuth, requireAdmin, controller.updateUserQuotas)
router.patch('/admin/:id/role', requireAuth, requireAdmin, controller.updateUserRole)

export default router
