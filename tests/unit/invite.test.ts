import { describe, expect, it } from 'vitest'
import {
  consumeInviteCode,
  createInvite,
  deleteInvite,
  isInviteRequired,
  listInvites
} from '../../apps/api/src/services/invite.service.js'
import { seedSiteSettings, seedUser } from '../helpers/api.js'

describe('invite service', () => {
  it('reflects site setting for invite requirement', async () => {
    await seedSiteSettings({ requireInviteCode: false })
    expect(await isInviteRequired()).toBe(false)

    await seedSiteSettings({ requireInviteCode: true })
    expect(await isInviteRequired()).toBe(true)
  })

  it('creates, consumes, and deletes invite codes', async () => {
    const admin = await seedUser({ username: 'inv_admin', password: 'pass', userrole: 7 })
    const invite = await createInvite(admin.user._id.toString(), { maxUses: 1 })

    const ok = await consumeInviteCode(invite.code)
    expect('error' in ok).toBe(false)

    const exhausted = await consumeInviteCode(invite.code)
    expect('error' in exhausted).toBe(true)

    const invites = await listInvites()
    expect(invites.some(row => row.code === invite.code)).toBe(true)

    const removed = await deleteInvite(invite.code)
    expect('error' in removed).toBe(false)
  })
})
