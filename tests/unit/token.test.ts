import { describe, expect, it } from 'vitest'
import { decryptToken, encryptToken } from '../../apps/api/src/utils/token.js'

describe('token utils', () => {
  it('encrypts and decrypts JWT payload', () => {
    const token = encryptToken({ id: 'user123', userrole: 2 })
    const decoded = decryptToken(token)
    expect(decoded.isTokenVerified).toBe(true)
    expect(decoded.id).toBe('user123')
    expect(decoded.userrole).toBe(2)
  })

  it('rejects invalid token', () => {
    const decoded = decryptToken('not-a-real-token')
    expect(decoded.isTokenVerified).toBe(false)
  })
})
