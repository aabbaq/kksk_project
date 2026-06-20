import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { getApp } from '../helpers/api.js'

describe('health endpoint', () => {
  it('returns ok', async () => {
    const res = await request(getApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.status).toBe(200)
  })
})
