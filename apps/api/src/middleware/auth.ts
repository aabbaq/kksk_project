import type { Request, Response, NextFunction } from 'express'
import { decryptToken, type DecodedToken } from '../utils/token.js'
import { sendError } from '../utils/response.js'

export interface AuthRequest extends Request {
  auth?: DecodedToken
}

function extractToken (req: Request): string | null {
  const header = req.headers.authorization
  if (!header) return null
  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

export function optionalAuth (req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (token) {
    req.auth = decryptToken(token)
  }
  next()
}

export function requireAuth (req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req)
  if (!token) {
    sendError(res, 106, 401)
    return
  }
  const decoded = decryptToken(token)
  if (!decoded.isTokenVerified) {
    sendError(res, 106, 401)
    return
  }
  req.auth = decoded
  next()
}
