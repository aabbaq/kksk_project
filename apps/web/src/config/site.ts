const DEFAULT_GITHUB_URL = 'https://github.com/aabbaq/kksk_project'

export function githubUrl (): string {
  const configured = import.meta.env.VITE_GITHUB_URL?.trim()
  return configured || DEFAULT_GITHUB_URL
}
