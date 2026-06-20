export const USER_ROLES = {
  GUEST: 0,
  ADMIN: 7
} as const

export const ERROR_CODES = {
  DB_ERROR: 500,
  USER_NOT_FOUND: 101,
  AUTH_FAILED: 102,
  TEXT_FORBIDDEN: 105,
  TOKEN_ERROR: 106,
  PASSWORD_REQUIRED: 107,
  WRONG_PASSWORD: 108,
  DUPLICATE_USER: 109,
  INVALID_USERNAME: 110,
  INVITE_REQUIRED: 111,
  INVALID_INVITE: 112,
  QUOTA_EXCEEDED: 113
} as const

export const ERROR_MESSAGES: Record<number, string> = {
  500: 'Database Error',
  101: 'User Error: ID Not Found',
  102: 'User Error: Name and Password Not Found',
  105: 'User Error: No Texts User In That Level Can View',
  106: 'User Error: User Token Error',
  107: 'This text is protected. Password required.',
  108: 'Wrong password for protected text.',
  109: 'Username already exists.',
  110: 'Username may only contain letters, numbers, and _ . - (max 20 chars).',
  111: 'An invite code is required to register.',
  112: 'Invalid or expired invite code.',
  113: 'Quota exceeded for this action.'
}

/** Letters, digits, underscore, dot, hyphen — no CJK or other scripts */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/
