export type UserRole = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface UserInfo {
  id?: string
  username: string
  nickname: string
  userrole: UserRole
  biography?: string
  alias?: string
  emoji?: string
  token?: string
}

export interface BlogTextPeek {
  id: string
  number: number
  title: string
  subtitle: string
  author: string
  date: string
  picture: string
  tag?: string
  mode?: {
    needShow: boolean
    protected: boolean
    hidden: boolean
    secretLevel: number
  }
}

export interface BlogTextDetail {
  id: string
  number: number
  title: string
  subtitle: string
  author: string
  owner: string
  tag: string
  picture: string
  content: string
  htmlContent: string
  secretLevel: number
  protected: boolean
  hidden: boolean
  isDraft: boolean
  dateInString: string
  lastDateInString: string
}

export interface ApiResponse<T = unknown> {
  status: number
  msg?: string
  data?: T
}

export interface PaginatedTexts {
  peekTexts: BlogTextPeek[]
  textsCount: number
  page: number
  pageSize: number
  totalPages: number
  tags: string[]
}
