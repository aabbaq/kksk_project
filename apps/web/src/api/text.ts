import client from './client'

export interface TextListParams {
  page?: number
  pageSize?: number
  search?: string
  tag?: string
  draft?: boolean
  needCardsInfo?: boolean
}

export async function getBlogTexts (params: TextListParams = {}) {
  const { data } = await client.post('/text/list', params)
  return data
}

export async function getOneText (params: {
  id?: string
  title?: string
  number?: number
  verified?: boolean
}) {
  const { data } = await client.get('/text/one', { params })
  return data
}

export async function verifyTextPassword (id: string, password: string) {
  const { data } = await client.post(`/text/${id}/verify-password`, { password })
  return data
}

export async function uploadBlog (payload: Record<string, unknown>) {
  const { data } = await client.post('/text/upload', payload)
  return data
}

export async function deleteText (id: string) {
  const { data } = await client.delete(`/text/${id}`)
  return data
}

export async function uploadImage (file: File) {
  const form = new FormData()
  form.append('image', file)
  // Do not set Content-Type — browser must add multipart boundary
  const { data } = await client.post('/upload/image', form)
  return data
}
