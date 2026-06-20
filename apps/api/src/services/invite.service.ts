import crypto from 'node:crypto'
import { InviteModel } from '../models/invite.model.js'
import { getSiteSettings } from '../modules/settings/settings.service.js'

function generateInviteCode () {
  return crypto.randomBytes(6).toString('hex')
}

export async function isInviteRequired () {
  const settings = await getSiteSettings()
  return settings.requireInviteCode ?? false
}

export async function consumeInviteCode (code: string) {
  const invite = await InviteModel.findOne({ code: code.trim() })
  if (!invite) return { error: 112 as const }
  if (invite.expiresAt && invite.expiresAt < new Date()) return { error: 112 as const }
  if (invite.usedCount >= invite.maxUses) return { error: 112 as const }

  invite.usedCount += 1
  await invite.save()
  return { ok: true as const }
}

export async function listInvites () {
  const docs = await InviteModel.find().sort({ createdAt: -1 })
  return docs.map((doc: InstanceType<typeof InviteModel>) => ({
    code: doc.code,
    maxUses: doc.maxUses,
    usedCount: doc.usedCount,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    note: doc.note ?? '',
    createdAt: doc.createdAt?.toISOString() ?? ''
  }))
}

export async function createInvite (
  createdBy: string,
  data: { maxUses: number, expiresInDays?: number, note?: string }
) {
  const code = generateInviteCode()
  const expiresAt = data.expiresInDays
    ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
    : undefined

  const invite = await InviteModel.create({
    code,
    createdBy,
    maxUses: data.maxUses,
    usedCount: 0,
    expiresAt,
    note: data.note ?? ''
  })

  return {
    code: invite.code,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    expiresAt: invite.expiresAt?.toISOString() ?? null,
    note: invite.note ?? '',
    createdAt: invite.createdAt?.toISOString() ?? ''
  }
}

export async function deleteInvite (code: string) {
  const result = await InviteModel.deleteOne({ code })
  if (!result.deletedCount) return { error: 404 as const }
  return { ok: true as const }
}
