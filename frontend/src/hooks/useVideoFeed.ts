'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Video } from '@/src/types/video'
import { getRecommendFeed } from '@/src/services/recommend'
import { likeVideo, unlikeVideo } from '@/src/services/like'
import { reportVideoView } from '@/src/services/video'

const DEFAULT_FEED_COUNT = 5

export function useVideoFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const reportedVideoIdsRef = useRef<Set<string>>(new Set())
  const reportingVideoIdsRef = useRef<Set<string>>(new Set())

  const mergeVideos = useCallback((current: Video[], incoming: Video[]) => {
    const existingIds = new Set(current.map((video) => video.videoId))
    const uniqueIncoming = incoming.filter((video) => !existingIds.has(video.videoId))
    return [...current, ...uniqueIncoming]
  }, [])

  const loadFeed = useCallback(async (count: number, append: boolean) => {
    setLoading(true)
    if (!append) {
      setError('')
    }

    try {
      const response = await getRecommendFeed({ count })
      setHasMore(response.hasMore)
      setVideos((prev) => (append ? mergeVideos(prev, response.items) : response.items))

      if (!append) {
        setCurrentIndex(0)
      }
    } catch (err) {
      console.error('Failed to load recommend feed', err)
      setError(err instanceof Error ? err.message : '加载推荐视频失败')
      if (!append) {
        setVideos([])
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }, [mergeVideos])

  useEffect(() => {
    void loadFeed(DEFAULT_FEED_COUNT, false)
  }, [loadFeed])

  const reportViewedVideo = useCallback(async (video: Video | null | undefined) => {
    const videoId = video?.videoId
    if (!videoId) {
      return
    }

    if (reportedVideoIdsRef.current.has(videoId) || reportingVideoIdsRef.current.has(videoId)) {
      return
    }

    reportingVideoIdsRef.current.add(videoId)

    try {
      await reportVideoView(videoId)
      reportedVideoIdsRef.current.add(videoId)
    } catch (err) {
      console.error('Failed to report video view', { videoId, err })
    } finally {
      reportingVideoIdsRef.current.delete(videoId)
    }
  }, [])

  const nextVideo = useCallback(() => {
    if (currentIndex >= videos.length - 1) {
      return
    }

    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    void reportViewedVideo(videos[nextIndex])
  }, [currentIndex, reportViewedVideo, videos])

  const prevVideo = useCallback(() => {
    if (currentIndex <= 0) {
      return
    }

    const prevIndex = currentIndex - 1
    setCurrentIndex(prevIndex)
    void reportViewedVideo(videos[prevIndex])
  }, [currentIndex, reportViewedVideo, videos])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return
    }

    await loadFeed(DEFAULT_FEED_COUNT, true)
  }, [hasMore, loadFeed, loading])

  useEffect(() => {
    if (videos.length - currentIndex <= 2 && hasMore) {
      void loadMore()
    }
  }, [currentIndex, hasMore, loadMore, videos.length])

  useEffect(() => {
    const currentVideo = videos[currentIndex]
    void reportViewedVideo(currentVideo)
  }, [currentIndex, reportViewedVideo, videos])

  const toggleLike = useCallback(async (videoId: string) => {
    const targetVideo = videos.find((video) => video.videoId === videoId)
    if (!targetVideo) {
      return
    }

    try {
      const result = targetVideo.liked
        ? await unlikeVideo(videoId)
        : await likeVideo(videoId)

      setVideos((prev) =>
        prev.map((video) =>
          video.videoId === videoId
            ? { ...video, liked: result.liked, likeCount: result.likeCount }
            : video
        )
      )
    } catch (err) {
      console.error('Failed to toggle like', err)
      setError(err instanceof Error ? err.message : '点赞操作失败')
    }
  }, [videos])

  const toggleFavorite = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.videoId === videoId
          ? {
              ...video,
              favorited: !video.favorited,
              favoriteCount: Math.max(0, (video.favoriteCount ?? 0) + (video.favorited ? -1 : 1)),
            }
          : video
      )
    )
  }, [])

  const currentVideo = videos[currentIndex] || null

  return {
    videos,
    currentVideo,
    currentIndex,
    loading,
    error,
    hasMore,
    nextVideo,
    prevVideo,
    toggleLike,
    toggleFavorite,
    loadMore,
    reload: () => loadFeed(DEFAULT_FEED_COUNT, false),
  }
}
