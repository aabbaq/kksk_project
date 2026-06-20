import { describe, expect, it } from 'vitest'
import {
  hashPassword,
  isBcryptHash,
  upgradePasswordIfLegacy,
  verifyPassword
} from '../../apps/api/src/utils/hash.js'

describe('hash utils', () => {
  it('hashes password with bcrypt', async () => {
    const hashed = await hashPassword('secret12')
    expect(isBcryptHash(hashed)).toBe(true)
    expect(await verifyPassword('secret12', hashed)).toBe(true)
    expect(await verifyPassword('wrong', hashed)).toBe(false)
  })

  it('verifies legacy md5 passwords and upgrades them', async () => {
    const legacy = '5f4dcc3b5aa765d61d8327deb882cf99' // md5("password")
    expect(await verifyPassword('password', legacy)).toBe(true)
    const upgraded = await upgradePasswordIfLegacy('password', legacy)
    expect(upgraded).toBeTruthy()
    if (upgraded) {
      expect(isBcryptHash(upgraded)).toBe(true)
      expect(await verifyPassword('password', upgraded)).toBe(true)
    }
  })
})
