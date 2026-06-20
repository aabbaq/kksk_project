import { describe, expect, it } from 'vitest'
import {
  loginSchema,
  registerSchema,
  updateUserQuotasSchema,
  upsertTextSchema
} from '@kksk/shared'

describe('shared schemas', () => {
  it('accepts valid register payload', () => {
    const parsed = registerSchema.safeParse({
      username: 'alice_01',
      password: 'secret12',
      nickname: 'Alice'
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects Chinese username', () => {
    const parsed = registerSchema.safeParse({
      username: '用户名',
      password: 'secret12'
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects username longer than 20 chars', () => {
    const parsed = registerSchema.safeParse({
      username: 'a'.repeat(21),
      password: 'secret12'
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects password longer than 20 chars', () => {
    const parsed = registerSchema.safeParse({
      username: 'alice',
      password: 'a'.repeat(21)
    })
    expect(parsed.success).toBe(false)
  })

  it('validates login max lengths', () => {
    expect(loginSchema.safeParse({ username: 'a', password: 'b' }).success).toBe(true)
    expect(loginSchema.safeParse({
      username: 'a'.repeat(21),
      password: 'b'
    }).success).toBe(false)
  })

  it('validates upsert text payload', () => {
    const parsed = upsertTextSchema.safeParse({
      blogtitle: 'Hello',
      blogcontent: '# Title',
      isDraft: false
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.blogsecretlevel).toBe(0)
    }
  })

  it('validates quota limits schema', () => {
    const parsed = updateUserQuotasSchema.safeParse({
      maxArticles: -1,
      maxDrafts: 5,
      maxCoverImages: 20
    })
    expect(parsed.success).toBe(true)
  })
})
