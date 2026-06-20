import { describe, expect, it } from 'vitest'
import { appErrorToHttp } from '../../apps/api/src/utils/response.js'

describe('response utils', () => {
  it('maps known error codes to HTTP status', () => {
    expect(appErrorToHttp(109)).toBe(409)
    expect(appErrorToHttp(110)).toBe(400)
    expect(appErrorToHttp(111)).toBe(400)
    expect(appErrorToHttp(112)).toBe(400)
    expect(appErrorToHttp(113)).toBe(429)
    expect(appErrorToHttp(105)).toBe(403)
    expect(appErrorToHttp(106)).toBe(401)
  })
})
