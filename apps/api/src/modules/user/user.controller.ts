import type { Response } from 'express'
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateUserRoleSchema,
  updateUserQuotasSchema,
  createInviteSchema
} from '@kksk/shared'
import type { AuthRequest } from '../../middleware/auth.js'
import { sendError, sendSuccess, appErrorToHttp } from '../../utils/response.js'
import * as userService from './user.service.js'
import * as inviteService from '../../services/invite.service.js'

export async function register (req: AuthRequest, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.registerUser(
    parsed.data.username,
    parsed.data.password,
    parsed.data.nickname,
    parsed.data.inviteCode
  )
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, result.userInfo)
}

export async function login (req: AuthRequest, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.loginUser(parsed.data.username, parsed.data.password)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, result.userInfo)
}

export async function tokenCheck (_req: AuthRequest, res: Response) {
  sendSuccess(res, { ok: true })
}

export async function getMe (req: AuthRequest, res: Response) {
  const result = await userService.getUserById(req.auth!.id!)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, { userInfo: result.userInfo })
}

export async function updateProfile (req: AuthRequest, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.updateProfile(req.auth!.id!, parsed.data)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, { userInfo: result.userInfo })
}

export async function changePassword (req: AuthRequest, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.changePassword(
    req.auth!.id!,
    parsed.data.currentPassword,
    parsed.data.newPassword
  )
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, { msg: 'Password updated' })
}

export async function listUsers (_req: AuthRequest, res: Response) {
  const result = await userService.listAllUsers()
  sendSuccess(res, { users: result })
}

export async function updateUserRole (req: AuthRequest, res: Response) {
  const parsed = updateUserRoleSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const targetId = req.params.id
  const result = await userService.setUserRole(targetId, parsed.data.role)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, { userInfo: result.userInfo })
}

export async function getUserQuotas (req: AuthRequest, res: Response) {
  const result = await userService.getUserQuotasAdmin(req.params.id)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, result)
}

export async function updateUserQuotas (req: AuthRequest, res: Response) {
  const parsed = updateUserQuotasSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.setUserQuotas(req.params.id, parsed.data)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, result)
}

export async function listInvites (_req: AuthRequest, res: Response) {
  const invites = await inviteService.listInvites()
  sendSuccess(res, { invites })
}

export async function createInvite (req: AuthRequest, res: Response) {
  const parsed = createInviteSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const invite = await inviteService.createInvite(req.auth!.id!, parsed.data)
  sendSuccess(res, { invite })
}

export async function removeInvite (req: AuthRequest, res: Response) {
  const result = await inviteService.deleteInvite(req.params.code)
  if ('error' in result && result.error) {
    sendError(res, result.error, appErrorToHttp(result.error))
    return
  }
  sendSuccess(res, { ok: true })
}
