import { api } from '@/src/api'
import type { Video } from '@/src/types/video'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
const API_ORIGIN = getApiOrigin(API_BASE_URL)

export interface RecommendRequest {
  count?: number
  offset?: number
}

export interface RecommendFeedPayload {
  items: Video[]
  hasMore: boolean
}

interface RecommendFeedItemDto {
  videoId: string
  authorId: string
  authorName: string
  title: string
  description: string
  videoUrl: string
  coverUrl: string
  likeCount: number
  favoriteCount: number
  liked: boolean
  favorited: boolean
  createdAt: string
}

interface RecommendFeedDto {
  items: RecommendFeedItemDto[]
  hasMore: boolean
}

export interface IRecommendService {
  getRecommendFeed(request?: RecommendRequest): Promise<RecommendFeedPayload>
}

function mapVideo(item: RecommendFeedItemDto): Video {
  const videoUrl = resolveMediaUrl(item.videoUrl)
  const coverUrl = resolveMediaUrl(item.coverUrl)

  return {
    videoId: item.videoId,
    authorId: item.authorId,
    authorName: item.authorName,
    title: item.title,
    description: item.description,
    videoUrl,
    url: videoUrl,
    coverUrl,
    likeCount: item.likeCount,
    favoriteCount: item.favoriteCount ?? 0,
    liked: item.liked,
    favorited: item.favorited,
    createdAt: item.createdAt,
  }
}

function getApiOrigin(apiBaseUrl: string): string {
  try {
    return new URL(apiBaseUrl).origin
  } catch {
    return 'http://localhost:8080'
  }
}

function resolveMediaUrl(url: string): string {
  if (!url) {
    return ''
  }
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`
  }
  return `${API_ORIGIN}/${url}`
}

export async function getRecommendFeed(request: RecommendRequest = {}): Promise<RecommendFeedPayload> {
  const count = request.count ?? 5
  const offset = request.offset ?? 0
  const params = new URLSearchParams({
    count: String(count),
    offset: String(offset),
  })
  const response = await api.get<RecommendFeedDto>(`/recommend/feed?${params.toString()}`)

  return {
    items: response.data.items.map(mapVideo),
    hasMore: response.data.hasMore,
  }
}
