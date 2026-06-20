import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createInvite } from '../../apps/api/src/services/invite.service.js'
import { bearer, getApp, registerViaApi, seedSiteSettings, seedUser } from '../helpers/api.js'

describe('auth API', () => {
  const app = getApp()

  it('registers and logs in a valid user', async () => {
    await seedSiteSettings()
    const register = await registerViaApi(app, {
      username: 'newuser',
      password: 'password1',
      nickname: 'New'
    })
    expect(register.status).toBe(200)
    expect(register.body.username).toBe('newuser')
    expect(register.body.token).toBeTruthy()

    const login = await request(app).post('/api/user/login').send({
      username: 'newuser',
      password: 'password1'
    })
    expect(login.status).toBe(200)
    expect(login.body.token).toBeTruthy()
  })

  it('rejects duplicate username', async () => {
    await seedSiteSettings()
    await registerViaApi(app, { username: 'dupuser', password: 'password1' })
    const res = await registerViaApi(app, { username: 'dupuser', password: 'password2' })
    expect(res.status).toBe(409)
    expect(res.body.status).toBe(109)
  })

  it('rejects invalid username characters', async () => {
    await seedSiteSettings()
    const res = await registerViaApi(app, {
      username: '用户',
      password: 'password1'
    })
    expect(res.status).toBe(400)
  })

  it('requires invite code when site setting is enabled', async () => {
    await seedSiteSettings({ requireInviteCode: true })
    const admin = await seedUser({ username: 'admin1', password: 'password1', userrole: 7 })
    const invite = await createInvite(admin.user._id.toString(), { maxUses: 1 })

    const without = await registerViaApi(app, {
      username: 'invited_no',
      password: 'password1'
    })
    expect(without.status).toBe(400)
    expect(without.body.status).toBe(111)

    const withCode = await registerViaApi(app, {
      username: 'invited_ok',
      password: 'password1',
      inviteCode: invite.code
    })
    expect(withCode.status).toBe(200)
  })

  it('rejects invalid credentials on login', async () => {
    await seedUser({ username: 'loginuser', password: 'rightpass' })
    const res = await request(app).post('/api/user/login').send({
      username: 'loginuser',
      password: 'wrongpass'
    })
    expect(res.status).toBe(401)
    expect(res.body.status).toBe(102)
  })

  it('returns profile with quotas for authenticated user', async () => {
    const { token } = await seedUser({ username: 'meuser', password: 'password1' })
    await seedSiteSettings()

    const res = await request(app).get('/api/user/me').set(bearer(token))
    expect(res.status).toBe(200)
    expect(res.body.userInfo.username).toBe('meuser')
    expect(res.body.userInfo.quotas.limits.maxArticles).toBe(10)
    expect(res.body.userInfo.quotas.usage.articles).toBe(0)
  })

  it('updates profile fields', async () => {
    const { token } = await seedUser({ username: 'profileuser', password: 'password1' })

    const res = await request(app)
      .patch('/api/user/profile')
      .set(bearer(token))
      .send({ nickname: 'Updated', biography: 'Bio text' })

    expect(res.status).toBe(200)
    expect(res.body.userInfo.nickname).toBe('Updated')
    expect(res.body.userInfo.biography).toBe('Bio text')
  })
})
