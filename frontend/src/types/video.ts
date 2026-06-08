// 视频类型定义
export interface Video {
  videoId: string
  title: string
  description?: string
  videoUrl?: string
  url?: string
  coverUrl: string
  authorId: string
  authorName: string
  likeCount: number
  favoriteCount?: number
  liked?: boolean
  favorited?: boolean
  createdAt: string
}

export interface VideoFeedState {
  videos: Video[]
  currentIndex: number
  loading: boolean
  hasMore: boolean
}
