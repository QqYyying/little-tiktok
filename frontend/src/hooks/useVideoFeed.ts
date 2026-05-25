'use client'

import { useState, useCallback } from 'react'
import { Video } from '@/src/types/video'

// Mock 数据用于前端开发
const mockVideos: Video[] = [
  { videoId: '1', title: '春日风景', url: '', coverUrl: '', authorId: 'u1', authorName: '小明', likeCount: 1234, favoriteCount: 100, liked: false, favorited: false, createdAt: '2026-05-20T10:00:00' },
  { videoId: '2', title: '城市夜景', url: '', coverUrl: '', authorId: 'u2', authorName: '小红', likeCount: 5678, favoriteCount: 200, liked: true, favorited: true, createdAt: '2026-05-19T15:00:00' },
  { videoId: '3', title: '美食制作', url: '', coverUrl: '', authorId: 'u3', authorName: '厨师张', likeCount: 2345, favoriteCount: 88, liked: false, favorited: false, createdAt: '2026-05-18T20:00:00' },
  { videoId: '4', title: '旅行日记', url: '', coverUrl: '', authorId: 'u1', authorName: '小明', likeCount: 8901, favoriteCount: 500, liked: false, favorited: true, createdAt: '2026-05-17T08:00:00' },
  { videoId: '5', title: '音乐演奏', url: '', coverUrl: '', authorId: 'u4', authorName: '音乐人', likeCount: 3456, favoriteCount: 150, liked: true, favorited: false, createdAt: '2026-05-16T12:00:00' },
]

export function useVideoFeed() {
  const [videos, setVideos] = useState<Video[]>(mockVideos)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // 上滑：下一个视频
  const nextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((i) => i + 1)
      // 预加载：当剩余不足2个时拉取更多
      if (videos.length - currentIndex <= 2) {
        loadMore()
      }
    }
  }, [currentIndex, videos.length])

  // 下滑：上一个视频
  const prevVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  // 加载更多视频
  const loadMore = useCallback(async () => {
    if (loading) return
    setLoading(true)
    // TODO: 替换为真实 API 调用
    // const res = await getRecommendVideos(5)
    // setVideos(prev => [...prev, ...res.data])
    setTimeout(() => setLoading(false), 500)
  }, [loading])

  // 点赞切换
  const toggleLike = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.videoId === videoId
          ? { ...v, liked: !v.liked, likeCount: v.liked ? v.likeCount - 1 : v.likeCount + 1 }
          : v
      )
    )
  }, [])

  // 收藏切换
  const toggleFavorite = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.videoId === videoId
          ? { ...v, favorited: !v.favorited, favoriteCount: v.favorited ? v.favoriteCount - 1 : v.favoriteCount + 1 }
          : v
      )
    )
  }, [])

  const currentVideo = videos[currentIndex] || null

  return {
    videos,
    currentVideo,
    currentIndex,
    loading,
    nextVideo,
    prevVideo,
    toggleLike,
    toggleFavorite,
    loadMore,
  }
}
