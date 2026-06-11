'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Video } from '@/src/types/video'
import { getRecommendFeed } from '@/src/services/recommend'
import { likeVideo, unlikeVideo } from '@/src/services/like'
import { reportVideoView } from '@/src/services/video'

const DEFAULT_FEED_COUNT = 5
const LOAD_MORE_THRESHOLD = 2

export function useVideoFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [pendingLikeVideoIds, setPendingLikeVideoIds] = useState<Set<string>>(() => new Set())
  const reportedVideoIdsRef = useRef<Set<string>>(new Set())
  const reportingVideoIdsRef = useRef<Set<string>>(new Set())
  const loadingFeedRef = useRef(false)
  const loadingFeedPromiseRef = useRef<Promise<number> | null>(null)
  const pendingLikeVideoIdsRef = useRef<Set<string>>(new Set())
  const videosRef = useRef<Video[]>([])
  const currentIndexRef = useRef(0)
  const hasMoreRef = useRef(false)
  const nextOffsetRef = useRef(0)

  const loadFeed = useCallback(async (count: number, append: boolean) => {
    if (loadingFeedRef.current) {
      return loadingFeedPromiseRef.current ?? 0
    }

    const loadPromise = (async () => {
      loadingFeedRef.current = true
      setLoading(true)
      if (!append) {
        setError('')
      }

      try {
        const offset = append ? nextOffsetRef.current : 0
        const response = await getRecommendFeed({ count, offset })
        setHasMore(response.hasMore)
        hasMoreRef.current = response.hasMore
        nextOffsetRef.current = offset + response.items.length

        setVideos((prev) => {
          const nextVideos = append ? [...prev, ...response.items] : response.items
          videosRef.current = nextVideos
          return nextVideos
        })

        if (!append) {
          currentIndexRef.current = 0
          setCurrentIndex(0)
        }

        return response.items.length
      } catch (err) {
        console.error('Failed to load recommend feed', err)
        setError(err instanceof Error ? err.message : '加载推荐视频失败')
        if (!append) {
          videosRef.current = []
          currentIndexRef.current = 0
          hasMoreRef.current = false
          nextOffsetRef.current = 0
          setVideos([])
          setCurrentIndex(0)
          setHasMore(false)
        }
        return 0
      } finally {
        loadingFeedRef.current = false
        loadingFeedPromiseRef.current = null
        setLoading(false)
      }
    })()

    loadingFeedPromiseRef.current = loadPromise
    return loadPromise
  }, [])

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

  const goToVideo = useCallback((nextIndex: number) => {
    currentIndexRef.current = nextIndex
    setCurrentIndex(nextIndex)
    void reportViewedVideo(videosRef.current[nextIndex])
  }, [reportViewedVideo])

  const nextVideo = useCallback(async () => {
    const currentVideoIndex = currentIndexRef.current
    if (videosRef.current.length === 0) {
      return
    }

    if (currentVideoIndex < videosRef.current.length - 1) {
      goToVideo(currentVideoIndex + 1)
      return
    }

    if (!hasMoreRef.current) {
      return
    }

    const loadedCount = await loadFeed(DEFAULT_FEED_COUNT, true)
    if (loadedCount > 0 && currentVideoIndex < videosRef.current.length - 1) {
      goToVideo(currentVideoIndex + 1)
    }
  }, [goToVideo, loadFeed])

  const prevVideo = useCallback(() => {
    const currentVideoIndex = currentIndexRef.current
    if (currentVideoIndex <= 0) {
      return
    }

    goToVideo(currentVideoIndex - 1)
  }, [goToVideo])

  const loadMore = useCallback(async () => {
    if (loadingFeedRef.current || !hasMoreRef.current) {
      return
    }

    await loadFeed(DEFAULT_FEED_COUNT, true)
  }, [loadFeed])

  useEffect(() => {
    if (videos.length - currentIndex <= LOAD_MORE_THRESHOLD && hasMore) {
      void loadMore()
    }
  }, [currentIndex, hasMore, loadMore, videos.length])

  useEffect(() => {
    const currentVideo = videos[currentIndex]
    void reportViewedVideo(currentVideo)
  }, [currentIndex, reportViewedVideo, videos])

  const toggleLike = useCallback(async (videoId: string) => {
    if (pendingLikeVideoIdsRef.current.has(videoId)) {
      return
    }

    const targetVideo = videosRef.current.find((video) => video.videoId === videoId)
    if (!targetVideo) {
      return
    }

    pendingLikeVideoIdsRef.current.add(videoId)
    setPendingLikeVideoIds(new Set(pendingLikeVideoIdsRef.current))
    setError('')

    try {
      const result = targetVideo.liked
        ? await unlikeVideo(videoId)
        : await likeVideo(videoId)

      setVideos((prev) => {
        const nextVideos = prev.map((video) =>
          video.videoId === videoId
            ? { ...video, liked: result.liked, likeCount: result.likeCount }
            : video
        )
        videosRef.current = nextVideos
        return nextVideos
      })
    } catch (err) {
      console.error('Failed to toggle like', err)
      setError(err instanceof Error ? err.message : '点赞操作失败，请稍后重试')
    } finally {
      pendingLikeVideoIdsRef.current.delete(videoId)
      setPendingLikeVideoIds(new Set(pendingLikeVideoIdsRef.current))
    }
  }, [])

  const toggleFavorite = useCallback((videoId: string) => {
    setVideos((prev) => {
      const nextVideos = prev.map((video) =>
        video.videoId === videoId
          ? {
              ...video,
              favorited: !video.favorited,
              favoriteCount: Math.max(0, (video.favoriteCount ?? 0) + (video.favorited ? -1 : 1)),
            }
          : video
      )
      videosRef.current = nextVideos
      return nextVideos
    })
  }, [])

  const currentVideo = videos[currentIndex] || null
  const nextVideoToPreload = videos[currentIndex + 1] || null
  const currentVideoLikePending = currentVideo ? pendingLikeVideoIds.has(currentVideo.videoId) : false

  return {
    videos,
    currentVideo,
    nextVideoToPreload,
    currentVideoLikePending,
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
