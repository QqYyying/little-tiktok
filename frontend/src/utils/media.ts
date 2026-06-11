const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

function getApiOrigin() {
  try {
    return new URL(
      DEFAULT_API_BASE,
      typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin
    ).origin
  } catch {
    return typeof window === 'undefined' ? 'http://localhost:8080' : window.location.origin
  }
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return new URL(normalizedPath, getApiOrigin()).toString()
}
