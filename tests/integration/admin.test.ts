import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { bearer, getApp, seedSiteSettings, seedUser } from '../helpers/api.js'

describe('admin API', () => {
  const app = getApp()

  it('lists users and updates role', async () => {
    const admin = await seedUser({ username: 'admin', password: 'pass', userrole: 7 })
    await seedUser({ username: 'member', password: 'pass', userrole: 1 })

    const list = await request(app)
      .get('/api/user/admin/list')
      .set(bearer(admin.token))
    expect(list.status).toBe(200)
    expect(list.body.users.length).toBeGreaterThanOrEqual(2)

    const target = list.body.users.find((u: { username: string }) => u.username === 'member')
    const updated = await request(app)
      .patch(`/api/user/admin/${target.id}/role`)
      .set(bearer(admin.token))
      .send({ role: 3 })
    expect(updated.status).toBe(200)
    expect(updated.body.userInfo.userrole).toBe(3)
  })

  it('manages invites', async () => {
    const admin = await seedUser({ username: 'admin_inv', password: 'pass', userrole: 7 })

    const created = await request(app)
      .post('/api/user/admin/invites')
      .set(bearer(admin.token))
      .send({ maxUses: 2, expiresInDays: 7, note: 'test' })
    expect(created.status).toBe(200)
    expect(created.body.invite.code).toBeTruthy()

    const list = await request(app)
      .get('/api/user/admin/invites')
      .set(bearer(admin.token))
    expect(list.body.invites.length).toBe(1)

    const del = await request(app)
      .delete(`/api/user/admin/invites/${created.body.invite.code}`)
      .set(bearer(admin.token))
    expect(del.status).toBe(200)
  })

  it('reads and updates per-user quotas', async () => {
    await seedSiteSettings()
    const admin = await seedUser({ username: 'admin_q', password: 'pass', userrole: 7 })
    const member = await seedUser({ username: 'member_q', password: 'pass', userrole: 1 })

    const get = await request(app)
      .get(`/api/user/admin/${member.user._id}/quotas`)
      .set(bearer(admin.token))
    expect(get.status).toBe(200)
    expect(get.body.quotas.limits.maxArticles).toBe(10)

    const patch = await request(app)
      .patch(`/api/user/admin/${member.user._id}/quotas`)
      .set(bearer(admin.token))
      .send({ maxArticles: 99, maxDrafts: 88, maxCoverImages: 77 })
    expect(patch.status).toBe(200)
    expect(patch.body.quotas.limits.maxArticles).toBe(99)
  })

  it('rejects admin routes for regular users', async () => {
    const { token } = await seedUser({ username: 'notadmin', password: 'pass', userrole: 1 })
    const res = await request(app)
      .get('/api/user/admin/list')
      .set(bearer(token))
    expect(res.status).toBe(403)
  })
})
