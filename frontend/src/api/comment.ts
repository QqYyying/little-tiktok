const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
}

export interface Comment {
  id: string
  videoId: string
  userId: string
  username: string
  content: string
  likeCount: number
  liked: boolean
  replyToId?: string
  replyToUsername?: string
  createdAt: string
}

export interface CommentResponse {
  items: Comment[]
  total: number
  page: number
  pageSize: number
}

export interface CreateCommentRequest {
  content: string
  replyToId?: string
}

function buildHeaders(extraHeaders: HeadersInit = {}) {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const payload: ApiEnvelope<T> = await response.json()
  if (!response.ok || payload.code !== 'OK') {
    throw new Error(payload.message || '请求失败')
  }
  return payload.data
}

export async function getComments(videoId: string, page = 1, pageSize = 20) {
  const response = await fetch(`${API_BASE}/comments/${videoId}?page=${page}&pageSize=${pageSize}`, {
    headers: buildHeaders(),
  })
  return unwrapResponse<CommentResponse>(response)
}

export async function createComment(videoId: string, body: CreateCommentRequest) {
  const response = await fetch(`${API_BASE}/comments/${videoId}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  return unwrapResponse<Comment>(response)
}

export async function deleteComment(commentId: string) {
  const response = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  return unwrapResponse<void>(response)
}

export async function likeComment(commentId: string) {
  const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
    method: 'POST',
    headers: buildHeaders(),
  })
  return unwrapResponse<void>(response)
}

export async function unlikeComment(commentId: string) {
  const response = await fetch(`${API_BASE}/comments/${commentId}/unlike`, {
    method: 'POST',
    headers: buildHeaders(),
  })
  return unwrapResponse<void>(response)
}