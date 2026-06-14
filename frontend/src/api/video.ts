import { resolveMediaUrl } from '@/src/utils/media'

const VIDEO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
}

export interface VideoRecord {
  videoId: string
  authorId: string
  authorName?: string
  title: string
  description: string
  videoUrl: string
  coverUrl: string
  likeCount: number
  favoriteCount?: number
  status: string
  createdAt: string
  updatedAt?: string
}

export interface MyVideosPageData {
  total: number
  page: number
  pageSize: number
  records: VideoRecord[]
}

export interface UploadVideoRequest {
  title: string
  description?: string
  file: File
  coverFile?: File | null
  coverUrl?: string
}

export interface DeleteVideoResponse {
  videoId: string
  deleted: boolean
  deletedAt: string
}

export interface ViewHistoryItem {
  videoId: string
  authorId: string
  authorName?: string
  title: string
  description?: string
  videoUrl?: string
  coverUrl: string
  likeCount: number
  createdAt: string
  viewedAt?: string
}

export interface ViewHistoryResponse {
  items: ViewHistoryItem[]
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

function normalizeVideoRecord(video: VideoRecord): VideoRecord {
  return {
    ...video,
    videoUrl: resolveMediaUrl(video.videoUrl),
    coverUrl: resolveMediaUrl(video.coverUrl),
  }
}

function normalizeViewHistoryItem(item: ViewHistoryItem): ViewHistoryItem {
  return {
    ...item,
    videoUrl: resolveMediaUrl(item.videoUrl),
    coverUrl: resolveMediaUrl(item.coverUrl),
  }
}

export async function uploadVideo(data: UploadVideoRequest): Promise<VideoRecord> {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('file', data.file)
  if (data.description) {
    formData.append('description', data.description)
  }
  if (data.coverFile) {
    formData.append('coverFile', data.coverFile)
  }
  if (data.coverUrl) {
    formData.append('coverUrl', data.coverUrl)
  }

  const response = await fetch(`${VIDEO_API_BASE}/videos`, {
    method: 'POST',
    headers: buildHeaders(),
    body: formData,
  })
  return normalizeVideoRecord(await unwrapResponse<VideoRecord>(response))
}

export async function getMyVideos(page: number = 1, pageSize: number = 10, keyword?: string): Promise<MyVideosPageData> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  if (keyword?.trim()) {
    params.set('keyword', keyword.trim())
  }

  const response = await fetch(`${VIDEO_API_BASE}/users/me/videos?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  const data = await unwrapResponse<MyVideosPageData>(response)
  return {
    ...data,
    records: data.records.map(normalizeVideoRecord),
  }
}

export async function getVideoDetail(videoId: string): Promise<VideoRecord> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/${videoId}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return normalizeVideoRecord(await unwrapResponse<VideoRecord>(response))
}

export async function deleteVideo(videoId: string): Promise<DeleteVideoResponse> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/${videoId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })
  return unwrapResponse<DeleteVideoResponse>(response)
}

export async function getViewHistory(): Promise<ViewHistoryResponse> {
  const response = await fetch(`${VIDEO_API_BASE}/videos/view/history`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  const data = await unwrapResponse<ViewHistoryResponse>(response)
  return {
    items: data.items.map(normalizeViewHistoryItem),
  }
}

export async function getLikedVideos(page: number = 1, pageSize: number = 10): Promise<MyVideosPageData> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const response = await fetch(`${VIDEO_API_BASE}/users/me/videos/liked?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  const data = await unwrapResponse<MyVideosPageData>(response)
  return {
    ...data,
    records: data.records.map(normalizeVideoRecord),
  }
}
