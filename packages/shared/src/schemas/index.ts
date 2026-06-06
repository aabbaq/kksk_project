import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export const registerSchema = z.object({
  username: z.string().min(2).max(32),
  password: z.string().min(6).max(128),
  nickname: z.string().min(1).max(64).optional()
})

export const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(64).optional(),
  biography: z.string().max(2000).optional(),
  alias: z.string().max(64).optional(),
  emoji: z.string().max(16).optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(128)
})

export const textListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  tag: z.string().optional(),
  draft: z.coerce.boolean().optional()
})

export const upsertTextSchema = z.object({
  blogid: z.string().optional(),
  blogtitle: z.string().min(1),
  blogsubtitle: z.string().optional().default(''),
  blogtag: z.string().optional().default(''),
  blogpic: z.string().optional().default('default'),
  blogcontent: z.string().default(''),
  blogsecretlevel: z.coerce.number().int().min(1).max(3).default(1),
  blogprotected: z.coerce.boolean().default(false),
  blogprotectedpassword: z.string().optional().default(''),
  bloghidden: z.coerce.boolean().default(false),
  blogupdate: z.coerce.boolean().default(false),
  blogauthor: z.string().optional(),
  isDraft: z.coerce.boolean().default(false)
})

export const verifyPasswordSchema = z.object({
  password: z.string().min(1)
})
