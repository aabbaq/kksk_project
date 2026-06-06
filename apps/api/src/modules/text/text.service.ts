import { TextModel } from '../../models/text.model.js'
import { dateToString } from '../../utils/response.js'
import { renderMarkdown } from '../../utils/markdown.js'
import type { AuthRequest } from '../../middleware/auth.js'

interface ListQuery {
  page: number
  pageSize: number
  search?: string
  tag?: string
  draft?: boolean
  needCardsInfo?: boolean
}

function buildPeekText (doc: InstanceType<typeof TextModel>, needCardsInfo = false) {
  const peek: Record<string, unknown> = {
    title: doc.title,
    subtitle: doc.subtitle ?? '',
    number: doc.number,
    id: doc._id.toString(),
    author: doc.author,
    date: dateToString(doc.date ?? new Date()),
    picture: doc.picture ?? 'default',
    tag: doc.tag ?? ''
  }
  if (needCardsInfo) {
    peek.mode = {
      needShow: false,
      protected: doc.protected ?? false,
      hidden: doc.hidden ?? false,
      secretLevel: doc.secretLevel ?? 1
    }
  }
  return peek
}

function buildVisibilityFilter (auth?: AuthRequest['auth'], draft?: boolean) {
  const role = auth?.isTokenVerified ? (auth.userrole ?? 0) : 0
  const userId = auth?.id

  if (draft) {
    if (!userId) return { _id: null }
    return { owner: userId, isDraft: true }
  }

  if (role === 7) {
    return { isDraft: { $ne: true } }
  }

  if (!auth?.isTokenVerified || role === 0) {
    return { isDraft: { $ne: true }, hidden: false, secretLevel: 1 }
  }

  return {
    isDraft: { $ne: true },
    $or: [
      { owner: userId },
      { hidden: false, secretLevel: { $lte: role } }
    ]
  }
}

export async function listTexts (auth: AuthRequest['auth'], query: ListQuery) {
  const filter: Record<string, unknown> = buildVisibilityFilter(auth, query.draft)

  if (query.tag) {
    filter.tag = query.tag
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$and = [
      ...(Array.isArray(filter.$and) ? filter.$and : []),
      {
        $or: [
          { title: regex },
          { subtitle: regex },
          { author: regex },
          { tag: regex }
        ]
      }
    ]
  }

  const skip = (query.page - 1) * query.pageSize
  const [docs, total, tags] = await Promise.all([
    TextModel.find(filter).sort({ date: -1 }).skip(skip).limit(query.pageSize),
    TextModel.countDocuments(filter),
    TextModel.distinct('tag', { tag: { $nin: [null, ''] } })
  ])

  return {
    peekTexts: docs.map(d => buildPeekText(d, query.needCardsInfo)),
    textsCount: total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    tags: (tags as string[]).filter(Boolean)
  }
}

export function canViewText (
  text: InstanceType<typeof TextModel>,
  auth?: AuthRequest['auth'],
  verifiedProtected = false
) {
  const role = auth?.isTokenVerified ? (auth.userrole ?? 0) : 0
  const userId = auth?.id

  if (text.isDraft) {
    return userId === text.owner?.toString() || role === 7
  }

  if (role === 7 || userId === text.owner?.toString()) return true
  if (text.hidden) return false
  if ((text.secretLevel ?? 1) > role) return false
  if (text.protected && !verifiedProtected) return 'password_required'
  return true
}

export async function getTextByQuery (query: { id?: string, title?: string, number?: number }) {
  const mongoQuery: Record<string, unknown> = {}
  if (query.id) mongoQuery._id = query.id
  else if (query.title) mongoQuery.title = query.title
  else if (query.number !== undefined) mongoQuery.number = query.number
  else return null

  return TextModel.findOne(mongoQuery)
}

function toDetail (doc: InstanceType<typeof TextModel>, includeContent = true) {
  const base = {
    id: doc._id.toString(),
    number: doc.number,
    title: doc.title,
    subtitle: doc.subtitle ?? '',
    author: doc.author,
    owner: doc.owner?.toString() ?? '',
    tag: doc.tag ?? '',
    picture: doc.picture ?? 'default',
    secretLevel: doc.secretLevel ?? 1,
    protected: doc.protected ?? false,
    hidden: doc.hidden ?? false,
    isDraft: doc.isDraft ?? false,
    dateInString: doc.dateInString ?? '',
    lastDateInString: doc.lastDateInString ?? ''
  }
  if (!includeContent) return base
  return {
    ...base,
    content: doc.content ?? '',
    htmlContent: doc.htmlContent ?? ''
  }
}

export async function getTextDetail (
  query: { id?: string, title?: string, number?: number },
  auth?: AuthRequest['auth'],
  verifiedProtected = false
) {
  const doc = await getTextByQuery(query)
  if (!doc) return { error: 501 as const }

  const access = canViewText(doc, auth, verifiedProtected)
  if (access === false) return { error: 105 as const }
  if (access === 'password_required') return { error: 107 as const }

  const includeContent = access === true
  return { text: toDetail(doc, includeContent) }
}

export async function verifyTextPassword (id: string, password: string, auth?: AuthRequest['auth']) {
  const doc = await TextModel.findById(id)
  if (!doc) return { error: 501 as const }
  if (!doc.protected) return { ok: true }

  if (doc.protectedPassword !== password) return { error: 108 as const }

  const access = canViewText(doc, auth, true)
  if (access !== true) return { error: 105 as const }
  return { text: toDetail(doc, true) }
}

export async function upsertText (
  auth: AuthRequest['auth'],
  body: {
    blogid?: string
    blogtitle: string
    blogsubtitle?: string
    blogtag?: string
    blogpic?: string
    blogcontent?: string
    blogsecretlevel?: number
    blogprotected?: boolean
    blogprotectedpassword?: string
    bloghidden?: boolean
    blogupdate?: boolean
    blogauthor?: string
    isDraft?: boolean
  }
) {
  const now = new Date()
  const htmlContent = renderMarkdown(body.blogcontent ?? '')
  const payload = {
    title: body.blogtitle,
    subtitle: body.blogsubtitle ?? '',
    tag: body.blogtag ?? '',
    picture: body.blogpic ?? 'default',
    content: body.blogcontent ?? '',
    htmlContent,
    secretLevel: body.blogsecretlevel ?? 1,
    protected: body.blogprotected ?? false,
    protectedPassword: body.blogprotectedpassword ?? '',
    hidden: body.bloghidden ?? false,
    isDraft: body.isDraft ?? false,
    lastDate: now,
    lastDateInString: dateToString(now, true)
  }

  if (body.blogupdate && body.blogid) {
    const existing = await TextModel.findById(body.blogid)
    if (!existing) return { error: 501 as const }
    const role = auth?.userrole ?? 0
    if (role !== 7 && existing.owner?.toString() !== auth?.id) return { error: 105 as const }
    await TextModel.findByIdAndUpdate(body.blogid, payload)
    return { msg: 'Update Success' }
  }

  const count = await TextModel.countDocuments({})
  await TextModel.create({
    ...payload,
    owner: auth?.id,
    author: body.blogauthor ?? 'unknown',
    number: count + 1,
    date: now,
    dateInString: dateToString(now, true)
  })
  return { msg: 'Upload Success' }
}

export async function deleteText (auth: AuthRequest['auth'], id: string) {
  const doc = await TextModel.findById(id)
  if (!doc) return { error: 501 as const }

  const role = auth?.userrole ?? 0
  if (role !== 7 && doc.owner?.toString() !== auth?.id) return { error: 105 as const }

  await TextModel.deleteOne({ _id: id })
  return { msg: 'Database Delete Daze' }
}
