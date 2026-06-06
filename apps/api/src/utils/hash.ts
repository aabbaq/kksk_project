import crypto from 'node:crypto'
import bcrypt from 'bcrypt'

function md5 (password: string): string {
  return crypto.createHash('md5').update(password).digest('hex')
}

export function isBcryptHash (stored: string): boolean {
  return stored.startsWith('$2')
}

export async function hashPassword (password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword (plain: string, stored: string): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored)
  }
  return md5(plain) === stored
}

export async function upgradePasswordIfLegacy (plain: string, stored: string): Promise<string | null> {
  if (isBcryptHash(stored)) return null
  const valid = md5(plain) === stored
  if (!valid) return null
  return hashPassword(plain)
}
