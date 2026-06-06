import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface TokenPayload {
  id: string
  userrole: number
}

export interface DecodedToken {
  isTokenVerified: boolean
  id?: string
  userrole?: number
  error?: unknown
}

export function encryptToken (data: { id: string, userrole: number }): string {
  return jwt.sign(
    { id: data.id, userrole: data.userrole },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
  )
}

export function decryptToken (token: string): DecodedToken {
  try {
    const data = jwt.verify(token, env.jwtSecret) as TokenPayload
    return {
      isTokenVerified: true,
      id: data.id,
      userrole: data.userrole
    }
  } catch (err) {
    return { isTokenVerified: false, error: err }
  }
}
