import type { Response } from 'express'
import { ERROR_MESSAGES } from '@kksk/shared'

/** Map internal app error codes to proper HTTP status codes */
const HTTP_STATUS_MAP: Record<number, number> = {
  101: 404,  // user not found
  102: 401,  // wrong credentials / login error
  105: 403,  // forbidden
  106: 401,  // invalid token
  107: 403,  // password required
  108: 401,  // wrong protected password
  109: 409,  // duplicate username
  404: 404,  // generic not found (used directly as app code + http status)
  501: 404,  // text not found (legacy code, kept for compat)
  500: 500   // generic server error
}

export function appErrorToHttp (code: number): number {
  return HTTP_STATUS_MAP[code] ?? 400
}

export function sendSuccess<T> (res: Response, data: T, status = 200): void {
  res.status(status).json({ status: 200, ...data as object })
}

export function sendError (res: Response, code: number, httpStatus?: number): void {
  const http = httpStatus ?? appErrorToHttp(code)
  res.status(http).json({
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
