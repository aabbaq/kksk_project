import { useAuthStore } from '@/stores/auth'

/** Admin (role 7) or article owner may edit/delete. */
export function canManageArticle (ownerId?: string | null) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return false
  if (auth.isAdmin) return true
  if (!ownerId || !auth.userId) return false
  return ownerId === auth.userId
}
