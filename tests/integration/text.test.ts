import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { bearer, getApp, seedSiteSettings, seedUser } from '../helpers/api.js'

describe('text API', () => {
  const app = getApp()

  async function publish (token: string, title: string, extra: Record<string, unknown> = {}) {
    return request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({
        blogtitle: title,
        blogsubtitle: 'sub',
        blogcontent: `# ${title}`,
        blogpic: 'default',
        blogsecretlevel: 0,
        blogprotected: false,
        bloghidden: false,
        blogupdate: false,
        isDraft: false,
        ...extra
      })
  }

  it('lists public texts for guests', async () => {
    const { token } = await seedUser({ username: 'author1', password: 'pass' })
    await publish(token, 'Public Post')

    const res = await request(app).post('/api/text/list').send({ page: 1, pageSize: 10 })
    expect(res.status).toBe(200)
    expect(res.body.peekTexts.length).toBe(1)
    expect(res.body.peekTexts[0].title).toBe('Public Post')
  })

  it('hides secret-level texts from guests', async () => {
    const { token } = await seedUser({ username: 'secretauthor', password: 'pass', userrole: 2 })
    await publish(token, 'Secret Post', { blogsecretlevel: 2 })

    const guest = await request(app).post('/api/text/list').send({ page: 1, pageSize: 10 })
    expect(guest.body.peekTexts.length).toBe(0)

    const reader = await seedUser({ username: 'reader2', password: 'pass', userrole: 2 })
    const authed = await request(app)
      .post('/api/text/list')
      .set(bearer(reader.token))
      .send({ page: 1, pageSize: 10 })
    expect(authed.body.peekTexts.length).toBe(1)
  })

  it('creates draft and publishes update', async () => {
    const { token } = await seedUser({ username: 'drafter', password: 'pass' })
    await seedSiteSettings()

    const draft = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({
        blogtitle: 'Draft One',
        blogcontent: 'draft body',
        isDraft: true,
        blogupdate: false
      })
    expect(draft.status).toBe(200)

    const listDrafts = await request(app)
      .post('/api/text/list')
      .set(bearer(token))
      .send({ page: 1, pageSize: 10, draft: true })
    expect(listDrafts.body.peekTexts.length).toBe(1)

    const id = listDrafts.body.peekTexts[0].id
    const update = await request(app)
      .post('/api/text/upload')
      .set(bearer(token))
      .send({
        blogid: id,
        blogtitle: 'Draft One',
        blogcontent: 'published body',
        blogupdate: true,
        isDraft: false
      })
    expect(update.status).toBe(200)
  })

  it('requires password for protected text detail', async () => {
    const { token } = await seedUser({ username: 'protector', password: 'pass' })
    await publish(token, 'Locked', {
      blogprotected: true,
      blogprotectedpassword: 'gate123'
    })

    const list = await request(app)
      .post('/api/text/list')
      .set(bearer(token))
      .send({ page: 1, pageSize: 10 })
    const id = list.body.peekTexts[0].id

    const blocked = await request(app).get('/api/text/one').query({ id })
    expect(blocked.status).toBe(403)
    expect(blocked.body.status).toBe(107)

    const unlocked = await request(app)
      .post(`/api/text/${id}/verify-password`)
      .send({ password: 'gate123' })
    expect(unlocked.status).toBe(200)
    expect(unlocked.body.docs[0].content).toContain('Locked')
  })

  it('deletes own text', async () => {
    const { token } = await seedUser({ username: 'deleter', password: 'pass' })
    await publish(token, 'To Delete')
    const list = await request(app)
      .post('/api/text/list')
      .set(bearer(token))
      .send({ page: 1, pageSize: 10 })
    const id = list.body.peekTexts[0].id

    const del = await request(app).delete(`/api/text/${id}`).set(bearer(token))
    expect(del.status).toBe(200)

    const after = await request(app)
      .post('/api/text/list')
      .set(bearer(token))
      .send({ page: 1, pageSize: 10 })
    expect(after.body.peekTexts.length).toBe(0)
  })

  it('caps secret level by user role on write', async () => {
    const { token } = await seedUser({ username: 'lowrole', password: 'pass', userrole: 1 })
    await publish(token, 'Capped Secret', { blogsecretlevel: 3 })

    const list = await request(app)
      .post('/api/text/list')
      .set(bearer(token))
      .send({ page: 1, pageSize: 10, needCardsInfo: true })
    const id = list.body.peekTexts[0].id

    const detail = await request(app)
      .get('/api/text/one')
      .set(bearer(token))
      .query({ id: list.body.peekTexts[0].id })
    expect(detail.body.docs[0].secretLevel).toBeLessThanOrEqual(1)
  })
})
