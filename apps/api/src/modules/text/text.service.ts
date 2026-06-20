import mongoose from 'mongoose'
import { TextModel } from '../../models/text.model.js'
import { UserModel } from '../../models/user.model.js'
import { CounterModel } from '../../models/counter.model.js'
import { dateToString } from '../../utils/response.js'
import { renderMarkdown } from '../../utils/markdown.js'
import { resolveOssPictureUrl } from '../../services/storage/oss-url.js'
import { assertArticleQuota, assertDraftQuota } from '../../services/quota.service.js'
import type { AuthRequest } from '../../middleware/auth.js'

interface ListQuery {
  page: number
  pageSize: number
  search?: string
  tag?: string
  draft?: boolean
  needCardsInfo?: boolean
}

type AuthorResolver = (doc: InstanceType<typeof TextModel>) => string

async function buildAuthorResolver (docs: InstanceType<typeof TextModel>[]): Promise<AuthorResolver> {
  const ownerIds = [...new Set(docs.map(d => d.owner?.toString()).filter(Boolean))] as string[]
  const authorNames = [...new Set(docs.map(d => d.author).filter((name): name is string => Boolean(name)))]

  if (!ownerIds.length && !authorNames.length) {
    return (doc) => doc.author ?? 'unknown'
  }

  const users = await UserModel.find({
    $or: [
      ...(ownerIds.length ? [{ _id: { $in: ownerIds } }] : []),
      ...(authorNames.length ? [{ username: { $in: authorNames } }] : [])
    ]
  })

  const byOwner = new Map(users.map(user => [user._id.toString(), user]))
  const byUsername = new Map(users.map(user => [user.username, user]))

  return (doc) => {
    const ownerId = doc.owner?.toString()
    if (ownerId && byOwner.has(ownerId)) {
      const user = byOwner.get(ownerId)!
      return user.nickname ?? user.username
    }
    if (doc.author && byUsername.has(doc.author)) {
      const user = byUsername.get(doc.author)!
      return user.nickname ?? user.username
    }
    return doc.author ?? 'unknown'
  }
}

function buildPeekText (
  doc: InstanceType<typeof TextModel>,
  resolveAuthor: AuthorResolver,
  needCardsInfo = false
) {
  const peek: Record<string, unknown> = {
    title: doc.title,
    subtitle: doc.subtitle ?? '',
    number: doc.number,
    id: doc._id.toString(),
    owner: doc.owner?.toString() ?? '',
    author: resolveAuthor(doc),
    date: dateToString(doc.date ?? new Date()),
    picture: doc.picture ?? 'default',
    tag: doc.tag ?? ''
  }
  if (needCardsInfo) {
    peek.mode = {
      needShow: false,
      protected: doc.protected ?? false,
      hidden: doc.hidden ?? false,
      secretLevel: doc.secretLevel ?? 0
    }
  }
  return peek
}

async function withSignedPicture<T extends { picture?: string }> (
  item: T,
  secretLevel = 0
): Promise<T> {
  if (!item.picture || item.picture === 'default') return item
  return {
    ...item,
    picture: await resolveOssPictureUrl(item.picture, secretLevel)
  }
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
    return { isDraft: { $ne: true }, hidden: false, secretLevel: 0 }
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
    const matchedUsers = await UserModel.find({
      $or: [{ username: regex }, { nickname: regex }]
    }).select('username')
    const matchedUsernames = matchedUsers.map(user => user.username)

    const searchOr: Record<string, unknown>[] = [
      { title: regex },
      { subtitle: regex },
      { author: regex },
      { tag: regex }
    ]
    if (matchedUsernames.length) {
      searchOr.push({ author: { $in: matchedUsernames } })
    }

    filter.$and = [
      ...(Array.isArray(filter.$and) ? filter.$and : []),
      { $or: searchOr }
    ]
  }

  const skip = (query.page - 1) * query.pageSize
  const [docs, total, tags] = await Promise.all([
    TextModel.find(filter).sort({ date: -1 }).skip(skip).limit(query.pageSize),
    TextModel.countDocuments(filter),
    TextModel.distinct('tag', { tag: { $nin: [null, ''] } })
  ])

  const resolveAuthor = await buildAuthorResolver(docs)

  return {
    peekTexts: await Promise.all(
      docs.map(async (d) => withSignedPicture(
        buildPeekText(d, resolveAuthor, query.needCardsInfo),
        d.secretLevel ?? 0
      ))
    ),
    textsCount: total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    tags: (tags as string[]).filter(Boolean)
  }
}

export function canViewText (
  text: InstanceType<typeof TextModel>,
  auth?: AuthRequest['auth']
) {
  const role = auth?.isTokenVerified ? (auth.userrole ?? 0) : 0
  const userId = auth?.id

  if (text.isDraft) {
    return userId === text.owner?.toString() || role === 7
  }

  if (role === 7 || userId === text.owner?.toString()) return true
  if (text.hidden) return false
  if ((text.secretLevel ?? 0) > role) return false
  if (text.protected) return 'password_required'
  return true
}

export async function getTextByQuery (query: { id?: string, title?: string, number?: number }) {
  // BUG-2 fix: validate ObjectId before querying to prevent Mongoose CastError crash
  const mongoQuery: Record<string, unknown> = {}
  if (query.id) {
    if (!mongoose.isValidObjectId(query.id)) return null
    mongoQuery._id = query.id
  } else if (query.title) {
    mongoQuery.title = query.title
  } else if (query.number !== undefined) {
    mongoQuery.number = query.number
  } else {
    return null
  }

  return TextModel.findOne(mongoQuery)
}

function toDetail (
  doc: InstanceType<typeof TextModel>,
  resolveAuthor: AuthorResolver,
  includeContent = true
) {
  const base = {
    id: doc._id.toString(),
    number: doc.number,
    title: doc.title,
    subtitle: doc.subtitle ?? '',
    author: resolveAuthor(doc),
    owner: doc.owner?.toString() ?? '',
    tag: doc.tag ?? '',
    picture: doc.picture ?? 'default',
    secretLevel: doc.secretLevel ?? 0,
    protected: doc.protected ?? false,
    hidden: doc.hidden ?? false,
    isDraft: doc.isDraft ?? false,
    dateInString: doc.dateInString ?? '',
    lastDateInString: doc.lastDateInString ?? ''
  }
  if (!includeContent) return base
  const markdown = doc.content ?? ''
  return {
    ...base,
    content: markdown,
    htmlContent: markdown ? renderMarkdown(markdown) : (doc.htmlContent ?? '')
  }
}

export async function getTextDetail (
  query: { id?: string, title?: string, number?: number },
  auth?: AuthRequest['auth']
) {
  const doc = await getTextByQuery(query)
  // BUG-9 fix: 404 for not found
  if (!doc) return { error: 404 as const }

  const access = canViewText(doc, auth)
  if (access === false) return { error: 105 as const }
  if (access === 'password_required') return { error: 107 as const }

  const includeContent = access === true
  const resolveAuthor = await buildAuthorResolver([doc])
  const text = await withSignedPicture(
    toDetail(doc, resolveAuthor, includeContent),
    doc.secretLevel ?? 0
  )
  return { text }
}

export async function verifyTextPassword (id: string, password: string, auth?: AuthRequest['auth']) {
  if (!mongoose.isValidObjectId(id)) return { error: 404 as const }
  const doc = await TextModel.findById(id)
  if (!doc) return { error: 404 as const }
  if (!doc.protected) return { ok: true }

  if (doc.protectedPassword !== password) return { error: 108 as const }

  const access = canViewText(doc, auth)
  if (access === 'password_required' || access === true) {
    const resolveAuthor = await buildAuthorResolver([doc])
    const text = await withSignedPicture(
      toDetail(doc, resolveAuthor, true),
      doc.secretLevel ?? 0
    )
    return { text }
  }
  return { error: 105 as const }
}

/** Atomically get the next article number, seeded from existing document count */
export async function getNextArticleNumber (): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    'text_number',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  // First-ever counter creation: seq will be 1, but we may have existing articles
  if (counter.seq === 1) {
    const existingCount = await TextModel.countDocuments({})
    if (existingCount > 0) {
      const seeded = await CounterModel.findByIdAndUpdate(
        'text_number',
        { seq: existingCount + 1 },
        { new: true }
      )
      return seeded!.seq
    }
  }
  return counter.seq
}

/** Max secret level a user role is allowed to write */
export function maxSecretLevelForRole (role: number): number {
  return Math.min(role, 3)
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
  const role = auth?.userrole ?? 0
  // BUG-8 fix: cap secret level to what the user's role allows
  const maxLevel = maxSecretLevelForRole(role)
  const secretLevel = Math.min(body.blogsecretlevel ?? 0, maxLevel)

  if (body.blogupdate && body.blogid) {
    if (!mongoose.isValidObjectId(body.blogid)) return { error: 404 as const }
    const existing = await TextModel.findById(body.blogid)
    if (!existing) return { error: 404 as const }
    if (role !== 7 && existing.owner?.toString() !== auth?.id) return { error: 105 as const }

    const nextIsDraft = body.isDraft ?? existing.isDraft ?? false
    if (existing.isDraft && !nextIsDraft) {
      const quota = await assertArticleQuota(auth!.id!, role)
      if ('error' in quota) return quota
    }
    if (!existing.isDraft && nextIsDraft) {
      const quota = await assertDraftQuota(auth!.id!, role)
      if ('error' in quota) return quota
    }

    // BUG-6 fix: only update fields that were explicitly provided
    const updateFields: Record<string, unknown> = {
      title: body.blogtitle,
      content: body.blogcontent ?? existing.content ?? '',
      htmlContent: renderMarkdown(body.blogcontent ?? existing.content ?? ''),
      secretLevel,
      protected: body.blogprotected ?? existing.protected ?? false,
      protectedPassword: body.blogprotectedpassword ?? existing.protectedPassword ?? '',
      hidden: body.bloghidden ?? existing.hidden ?? false,
      isDraft: body.isDraft ?? existing.isDraft ?? false,
      lastDate: now,
      lastDateInString: dateToString(now, true)
    }
    // Only update optional display fields if explicitly provided
    if (body.blogsubtitle !== undefined) updateFields.subtitle = body.blogsubtitle
    if (body.blogtag !== undefined) updateFields.tag = body.blogtag
    if (body.blogpic !== undefined) updateFields.picture = body.blogpic

    await TextModel.findByIdAndUpdate(body.blogid, updateFields)
    return { msg: 'Update Success' }
  }

  // BUG-5 fix: use atomic counter for article number
  const quota = body.isDraft
    ? await assertDraftQuota(auth!.id!, role)
    : await assertArticleQuota(auth!.id!, role)
  if ('error' in quota) return quota

  const number = await getNextArticleNumber()

  await TextModel.create({
    title: body.blogtitle,
    subtitle: body.blogsubtitle ?? '',
    tag: body.blogtag ?? '',
    picture: body.blogpic ?? 'default',
    content: body.blogcontent ?? '',
    htmlContent,
    secretLevel,
    protected: body.blogprotected ?? false,
    protectedPassword: body.blogprotectedpassword ?? '',
    hidden: body.bloghidden ?? false,
    isDraft: body.isDraft ?? false,
    lastDate: now,
    lastDateInString: dateToString(now, true),
    owner: auth?.id,
    author: body.blogauthor ?? 'unknown',
    number,
    date: now,
    dateInString: dateToString(now, true)
  })
  return { msg: 'Upload Success' }
}

export async function deleteText (auth: AuthRequest['auth'], id: string) {
  if (!mongoose.isValidObjectId(id)) return { error: 404 as const }
  const doc = await TextModel.findById(id)
  if (!doc) return { error: 404 as const }

  const role = auth?.userrole ?? 0
  if (role !== 7 && doc.owner?.toString() !== auth?.id) return { error: 105 as const }

  await TextModel.deleteOne({ _id: id })
  return { msg: 'Database Delete Daze' }
}
