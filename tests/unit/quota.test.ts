import { describe, expect, it } from 'vitest'
import {
  assertArticleQuota,
  assertCoverImageQuota,
  assertDraftQuota,
  getQuotaSnapshot,
  recordCoverUpload
} from '../../apps/api/src/services/quota.service.js'
import { seedSiteSettings, seedUser } from '../helpers/api.js'
import { TextModel } from '../../apps/api/src/models/text.model.js'

describe('quota service', () => {
  it('computes usage and limits from settings', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 2, maxDrafts: 3, maxCoverImages: 4 }
    })
    const { user } = await seedUser({ username: 'quota_svc', password: 'pass' })

    const snapshot = await getQuotaSnapshot(user._id.toString(), 1)
    expect(snapshot.limits.maxArticles).toBe(2)
    expect(snapshot.usage.articles).toBe(0)
  })

  it('uses per-user overrides', async () => {
    await seedSiteSettings()
    const { user } = await seedUser({
      username: 'override_user',
      password: 'pass',
      quotas: { maxArticles: 7, maxDrafts: 8, maxCoverImages: 9 }
    })

    const snapshot = await getQuotaSnapshot(user._id.toString(), 1)
    expect(snapshot.limits.maxArticles).toBe(7)
    expect(snapshot.limits.maxDrafts).toBe(8)
    expect(snapshot.limits.maxCoverImages).toBe(9)
  })

  it('detects exceeded article quota', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 1, maxDrafts: 5, maxCoverImages: 5 }
    })
    const { user } = await seedUser({ username: 'over_art', password: 'pass' })

    await TextModel.create({
      owner: user._id.toString(),
      title: 'One',
      isDraft: false,
      number: 1,
      date: new Date(),
      dateInString: '2026/1/1'
    })

    const result = await assertArticleQuota(user._id.toString(), 1)
    expect('error' in result).toBe(true)
  })

  it('tracks cover uploads', async () => {
    await seedSiteSettings({
      defaultQuotas: { maxArticles: 5, maxDrafts: 5, maxCoverImages: 1 }
    })
    const { user } = await seedUser({ username: 'cover_track', password: 'pass' })

    await recordCoverUpload(user._id.toString(), 'https://example.com/a.jpg')
    const draftCheck = await assertDraftQuota(user._id.toString(), 1)
    expect('error' in draftCheck).toBe(false)

    const coverCheck = await assertCoverImageQuota(user._id.toString(), 1)
    expect('error' in coverCheck).toBe(true)
  })
})
