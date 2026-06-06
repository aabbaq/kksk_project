import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.js'
import { sendError } from '../utils/response.js'

export function requireAdmin (req: AuthRequest, res: Response, next: NextFunction): void {
  if ((req.auth?.userrole ?? 0) !== 7) {
    sendError(res, 105, 403)
    return
  }
  next()
}
