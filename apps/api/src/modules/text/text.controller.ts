import type { Response } from 'express'
import {
  textListQuerySchema,
  upsertTextSchema,
  verifyPasswordSchema
} from '@kksk/shared'
import type { AuthRequest } from '../../middleware/auth.js'
import { sendError, sendSuccess } from '../../utils/response.js'
import * as textService from './text.service.js'

export async function list (req: AuthRequest, res: Response) {
  const parsed = textListQuerySchema.safeParse({
    ...req.query,
    ...req.body,
    needCardsInfo: req.body?.needCardsInfo
  })
  if (!parsed.success) {
    sendError(res, 500, 400)
    return
  }
  const result = await textService.listTexts(req.auth, {
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    search: parsed.data.search,
    tag: parsed.data.tag,
    draft: parsed.data.draft,
    needCardsInfo: Boolean(req.body?.needCardsInfo)
  })
  sendSuccess(res, result)
}

export async function getOne (req: AuthRequest, res: Response) {
  const query = {
    id: req.query.id as string | undefined,
    title: req.query.title as string | undefined,
    number: req.query.number !== undefined ? Number(req.query.number) : undefined
  }
  const verified = req.query.verified === 'true'
  const result = await textService.getTextDetail(query, req.auth, verified)
  if ('error' in result && result.error) {
    sendError(res, result.error, result.error === 107 ? 403 : result.error)
    return
  }
  sendSuccess(res, { docs: [result.text] })
}

export async function verifyPassword (req: AuthRequest, res: Response) {
  const parsed = verifyPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 108, 400)
    return
  }
  const result = await textService.verifyTextPassword(req.params.id, parsed.data.password, req.auth)
  if ('error' in result && result.error) {
    sendError(res, result.error, result.error)
    return
  }
  sendSuccess(res, { docs: [result.text] })
}

export async function upload (req: AuthRequest, res: Response) {
  const parsed = upsertTextSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 500, 400)
    return
  }
  const result = await textService.upsertText(req.auth, {
    ...parsed.data,
    blogauthor: parsed.data.blogauthor ?? req.auth?.id
  })
  if ('error' in result && result.error) {
    sendError(res, result.error, result.error)
    return
  }
  sendSuccess(res, result)
}

export async function remove (req: AuthRequest, res: Response) {
  const result = await textService.deleteText(req.auth, req.params.id)
  if ('error' in result && result.error) {
    sendError(res, result.error, result.error)
    return
  }
  sendSuccess(res, result)
}
