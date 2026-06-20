import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { bearer, getApp, seedSiteSettings, seedUser } from '../helpers/api.js'

describe('settings API', () => {
  const app = getApp()

  it('returns public site settings', async () => {
    await seedSiteSettings({ requireInviteCode: true })
    const res = await request(app).get('/api/settings')
    expect(res.status).toBe(200)
    expect(res.body.requireInviteCode).toBe(true)
    expect(res.body.defaultQuotas.maxArticles).toBe(10)
    expect(res.body.effectiveDriver).toBe('local')
  })

  it('allows admin to update site settings', async () => {
    await seedSiteSettings()
    const { token } = await seedUser({ username: 'adminset', password: 'pass', userrole: 7 })

    const res = await request(app)
      .patch('/api/settings')
      .set(bearer(token))
      .send({
        requireInviteCode: true,
        defaultQuotas: { maxArticles: 3, maxDrafts: 2, maxCoverImages: 4 }
      })

    expect(res.status).toBe(200)
    expect(res.body.requireInviteCode).toBe(true)
    expect(res.body.defaultQuotas.maxArticles).toBe(3)
  })

  it('forbids non-admin from updating settings', async () => {
    const { token } = await seedUser({ username: 'regular', password: 'pass', userrole: 1 })
    const res = await request(app)
      .patch('/api/settings')
      .set(bearer(token))
      .send({ requireInviteCode: true })

    expect(res.status).toBe(403)
    expect(res.body.status).toBe(105)
  })
})
