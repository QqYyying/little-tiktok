import { api } from '@/src/api'
import type { Video } from '@/src/types/video'
import { resolveMediaUrl } from '@/src/utils/media'

export interface RecommendRequest {
  count?: number
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
  liked: boolean
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

  return {
    videoId: item.videoId,
    authorId: item.authorId,
    authorName: item.authorName,
    title: item.title,
    description: item.description,
    videoUrl,
    url: videoUrl,
    coverUrl: resolveMediaUrl(item.coverUrl),
    likeCount: item.likeCount,
    favoriteCount: 0,
    liked: item.liked,
    favorited: false,
    createdAt: item.createdAt,
  }
}

export async function getRecommendFeed(request: RecommendRequest = {}): Promise<RecommendFeedPayload> {
  const count = request.count ?? 5
  const response = await api.get<RecommendFeedDto>(`/recommend/feed?count=${count}`)

  return {
    items: response.data.items.map(mapVideo),
    hasMore: response.data.hasMore,
  }
}
