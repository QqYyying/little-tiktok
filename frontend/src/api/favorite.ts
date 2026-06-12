// 收藏相关 API
import { api, ApiResponse } from './index'
import { Video } from '@/src/types/video'
import { MyVideosPageData, VideoRecord } from './video'

const VIDEO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
}

interface FavoriteStatus {
  videoId: string
  favorited: boolean
  favoriteCount: number
}

function buildHeaders(extraHeaders: HeadersInit = {}) {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token')
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const payload: ApiEnvelope<T> = await response.json()
  if (!response.ok || payload.code !== 'OK') {
    throw new Error(payload.message || 'request failed')
  }
  return payload.data
}

// 收藏视频
export async function favoriteVideo(videoId: string): Promise<FavoriteStatus> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/${videoId}/favorite`, {
    method: 'POST',
    headers: buildHeaders(),
  })
  return unwrapResponse<FavoriteStatus>(response)
}

// 取消收藏
export async function unfavoriteVideo(videoId: string): Promise<FavoriteStatus> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/${videoId}/favorite`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  return unwrapResponse<FavoriteStatus>(response)
}

// 获取收藏状态
export async function getFavoriteStatus(videoId: string): Promise<FavoriteStatus> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/${videoId}/favorite/status`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return unwrapResponse<FavoriteStatus>(response)
}

// 获取收藏列表
export async function getFavorites(page = 1, pageSize = 10): Promise<MyVideosPageData> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const response = await fetch(`${VIDEO_API_BASE}/users/me/videos/favorites?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  const data = await unwrapResponse<MyVideosPageData>(response)
  return data
}
