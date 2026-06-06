import type { Response } from 'express'
import { ERROR_MESSAGES } from '@kksk/shared'

export function sendSuccess<T> (res: Response, data: T, status = 200): void {
  res.status(status).json({ status: 200, ...data as object })
}

export function sendError (res: Response, code: number, httpStatus?: number): void {
  res.status(httpStatus ?? code).json({
    status: code,
    msg: ERROR_MESSAGES[code] ?? 'Unknown Error'
  })
}

export function dateToString (date: Date, needTime = false, connector = '/'): string {
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  let dateString = `${year}${connector}${month}${connector}${day}`
  if (needTime) {
    const hour = date.getHours().toString()
    const minute = date.getMinutes().toString()
    const second = date.getSeconds().toString()
    dateString += ` ${hour}:${minute}:${second}`
  }
  return dateString
}
