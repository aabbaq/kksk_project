import type { Response } from 'express'
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateUserRoleSchema
} from '@kksk/shared'
import type { AuthRequest } from '../../middleware/auth.js'
import { sendError, sendSuccess, appErrorToHttp } from '../../utils/response.js'
import * as userService from './user.service.js'

export async function register (req: AuthRequest, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 102, 400)
    return
  }
  const result = await userService.registerUser(
    parsed.data.username,
    parsed.data.password,
    parsed.data.nickname
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
