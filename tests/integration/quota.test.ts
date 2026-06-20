import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { bearer, getApp, seedSiteSettings, seedUser } from '../helpers/api.js'

describe('quota enforcement', () => {
  const app = getApp()

  it('blocks article creation when published quota exceeded', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 1, maxDrafts: 5, maxCoverImages: 20 }
    })
    const { token } = await seedUser({ username: 'quota_user', password: 'pass' })

    const first = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({ blogtitle: 'First', blogcontent: 'a', isDraft: false, blogupdate: false })
    expect(first.status).toBe(200)

    const second = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({ blogtitle: 'Second', blogcontent: 'b', isDraft: false, blogupdate: false })
    expect(second.status).toBe(429)
    expect(second.body.status).toBe(113)
  })

  it('blocks draft creation when draft quota exceeded', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 10, maxDrafts: 1, maxCoverImages: 20 }
    })
    const { token } = await seedUser({ username: 'draft_quota', password: 'pass' })

    const first = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({ blogtitle: 'Draft A', blogcontent: 'a', isDraft: true, blogupdate: false })
    expect(first.status).toBe(200)

    const second = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({ blogtitle: 'Draft B', blogcontent: 'b', isDraft: true, blogupdate: false })
    expect(second.status).toBe(429)
    expect(second.body.status).toBe(113)
  })

  it('blocks cover upload when image quota exceeded', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 10, maxDrafts: 5, maxCoverImages: 1 }
    })
    const { token } = await seedUser({ username: 'img_quota', password: 'pass' })

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    const first = await request(app)
      .post('/api/upload/image')
      .set(bearer(token))
      .attach('image', png, 'cover1.png')
    expect(first.status).toBe(200)

    const second = await request(app)
      .post('/api/upload/image')
      .set(bearer(token))
      .attach('image', png, 'cover2.png')
    expect(second.status).toBe(429)
    expect(second.body.status).toBe(113)
  })

  it('allows admin unlimited uploads', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 1, maxDrafts: 1, maxCoverImages: 1 }
    })
    const { token } = await seedUser({ username: 'admin_quota', password: 'pass', userrole: 7 })

    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/text/upload')
        .set(bearer(token))
        .send({
          blogtitle: `Admin ${i}`,
          blogcontent: 'x',
          isDraft: false,
          blogupdate: false
        })
      expect(res.status).toBe(200)
    }
  })
})
