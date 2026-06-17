'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Video } from '@/src/types/video'
import { getRecommendFeed } from '@/src/services/recommend'
import { likeVideo, unlikeVideo } from '@/src/services/like'
import { favoriteVideo, unfavoriteVideo } from '@/src/services/favorite'
import { reportVideoView } from '@/src/services/video'
import { useAuth } from '@/src/hooks/useAuth'

const DEFAULT_FEED_COUNT = 8
const LOAD_MORE_COUNT = 20
const LOAD_MORE_THRESHOLD = 3
const GUEST_VIEWED_VIDEO_IDS_KEY = 'little-tiktok:guest-viewed-video-ids'
const MAX_GUEST_VIEWED_VIDEO_IDS = 500
const MAX_GUEST_FEED_FETCH_PAGES = 5
const PRELOAD_VIDEO_COUNT = 2  // 预加载视频数量

function readGuestViewedVideoIds() {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  try {
    const raw = localStorage.getItem(GUEST_VIEWED_VIDEO_IDS_KEY)
    const ids = raw ? JSON.parse(raw) : []
    if (!Array.isArray(ids)) {
      return new Set<string>()
    }

    return new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0))
  } catch {
    return new Set<string>()
  }
}

function writeGuestViewedVideoIds(ids: Set<string>) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const nextIds = Array.from(ids).slice(-MAX_GUEST_VIEWED_VIDEO_IDS)
    localStorage.setItem(GUEST_VIEWED_VIDEO_IDS_KEY, JSON.stringify(nextIds))
  } catch {
    // Ignore storage failures so browsing still works in private or restricted modes.
  }
}

export function useVideoFeed() {
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [pendingLikeVideoIds, setPendingLikeVideoIds] = useState<Set<string>>(() => new Set())
  const [pendingFavoriteVideoIds, setPendingFavoriteVideoIds] = useState<Set<string>>(() => new Set())
  const reportedVideoIdsRef = useRef<Set<string>>(new Set())
  const reportingVideoIdsRef = useRef<Set<string>>(new Set())
  const loadingFeedRef = useRef(false)
  const loadingFeedPromiseRef = useRef<Promise<number> | null>(null)
  const pendingLikeVideoIdsRef = useRef<Set<string>>(new Set())
  const pendingFavoriteVideoIdsRef = useRef<Set<string>>(new Set())
  const guestViewedVideoIdsRef = useRef<Set<string>>(new Set())
  const guestFeedOffsetRef = useRef(0)
  const videosRef = useRef<Video[]>([])
  const currentIndexRef = useRef(0)
  const hasMoreRef = useRef(false)

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
        const guestViewedVideoIds = isAuthenticated ? new Set<string>() : readGuestViewedVideoIds()
        guestViewedVideoIdsRef.current = guestViewedVideoIds
        const existingIds = new Set(append ? videosRef.current.map((video) => video.videoId) : [])
        const collectedItems: Video[] = []
        let nextHasMore = false
        let offset = isAuthenticated ? 0 : append ? guestFeedOffsetRef.current : 0
        let pagesFetched = 0

        do {
          // The backend removes viewed videos from the recommendation result set for logged-in users.
          // Always fetching logged-in feeds from offset 0 avoids skipping items while that set shrinks.
          const response = await getRecommendFeed({ count, offset: isAuthenticated ? 0 : offset })
          nextHasMore = response.hasMore

          const items = response.items.filter((video) => {
            if (existingIds.has(video.videoId)) {
              return false
            }
            return isAuthenticated || !guestViewedVideoIds.has(video.videoId)
          })

          for (const item of items) {
            existingIds.add(item.videoId)
            collectedItems.push(item)
          }

          pagesFetched += 1
          offset += response.items.length
        } while (
          !isAuthenticated &&
          collectedItems.length === 0 &&
          nextHasMore &&
          pagesFetched < MAX_GUEST_FEED_FETCH_PAGES
        )

        setHasMore(nextHasMore)
        hasMoreRef.current = nextHasMore
        if (!isAuthenticated) {
          guestFeedOffsetRef.current = offset
        }

        let addedCount = 0
        setVideos((prev) => {
          addedCount = collectedItems.length
          const nextVideos = append ? [...prev, ...collectedItems] : collectedItems
          videosRef.current = nextVideos
          return nextVideos
        })

        if (!append) {
          currentIndexRef.current = 0
          setCurrentIndex(0)
        }

        return addedCount
      } catch (err) {
        console.error('Failed to load recommend feed', err)
        setError(err instanceof Error ? err.message : '加载推荐视频失败')
        if (!append) {
          videosRef.current = []
          currentIndexRef.current = 0
          hasMoreRef.current = false
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
  }, [isAuthenticated])

  useEffect(() => {
    if (!authLoading) {
      void loadFeed(DEFAULT_FEED_COUNT, false)
    }
  }, [authLoading, loadFeed])

  const reportViewedVideo = useCallback(async (video: Video | null | undefined) => {
    const videoId = video?.videoId
    if (!videoId) {
      return
    }

    if (!isAuthenticated) {
      const guestViewedVideoIds = guestViewedVideoIdsRef.current.size > 0
        ? new Set(guestViewedVideoIdsRef.current)
        : readGuestViewedVideoIds()
      guestViewedVideoIds.add(videoId)
      guestViewedVideoIdsRef.current = guestViewedVideoIds
      writeGuestViewedVideoIds(guestViewedVideoIds)
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
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      guestViewedVideoIdsRef.current = readGuestViewedVideoIds()
      guestFeedOffsetRef.current = 0
      reportedVideoIdsRef.current.clear()
      reportingVideoIdsRef.current.clear()
    }
  }, [isAuthenticated])

  const preloadVideos = useCallback((fromIndex: number) => {
    // 预加载当前视频之后的多个视频
    for (let i = 1; i <= PRELOAD_VIDEO_COUNT; i++) {
      const preloadIndex = fromIndex + i
      const video = videosRef.current[preloadIndex]
      if (video && (video.videoUrl || video.url)) {
        // 创建一个临时的 video 元素进行预加载
        const preloadVideo = document.createElement('video')
        preloadVideo.src = video.videoUrl || video.url || ''
        preloadVideo.preload = 'auto'
        preloadVideo.muted = true
        preloadVideo.load()
      }
    }
  }, [])

  const goToVideo = useCallback((nextIndex: number) => {
    currentIndexRef.current = nextIndex
    setCurrentIndex(nextIndex)
    void reportViewedVideo(videosRef.current[nextIndex])
    // 触发预加载
    preloadVideos(nextIndex)
  }, [reportViewedVideo, preloadVideos])

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

    const loadedCount = await loadFeed(LOAD_MORE_COUNT, true)
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

    await loadFeed(LOAD_MORE_COUNT, true)
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
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      requireAuth()
      return
    }

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
  }, [authLoading, isAuthenticated, requireAuth])

  const toggleFavorite = useCallback(async (videoId: string) => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      requireAuth()
      return
    }

    if (pendingFavoriteVideoIdsRef.current.has(videoId)) {
      return
    }

    const targetVideo = videosRef.current.find((video) => video.videoId === videoId)
    if (!targetVideo) {
      return
    }

    pendingFavoriteVideoIdsRef.current.add(videoId)
    setPendingFavoriteVideoIds(new Set(pendingFavoriteVideoIdsRef.current))
    setError('')

    try {
      const result = targetVideo.favorited
        ? await unfavoriteVideo(videoId)
        : await favoriteVideo(videoId)

      setVideos((prev) => {
        const nextVideos = prev.map((video) =>
          video.videoId === videoId
            ? { ...video, favorited: result.favorited, favoriteCount: result.favoriteCount }
            : video
        )
        videosRef.current = nextVideos
        return nextVideos
      })
    } catch (err) {
      console.error('Failed to toggle favorite', err)
      setError(err instanceof Error ? err.message : '收藏操作失败，请稍后重试')
    } finally {
      pendingFavoriteVideoIdsRef.current.delete(videoId)
      setPendingFavoriteVideoIds(new Set(pendingFavoriteVideoIdsRef.current))
    }
  }, [authLoading, isAuthenticated, requireAuth])

  const updateCommentCount = useCallback((videoId: string, commentCount: number) => {
    setVideos((prev) => {
      const nextVideos = prev.map((video) =>
        video.videoId === videoId
          ? { ...video, commentCount }
          : video
      )
      videosRef.current = nextVideos
      return nextVideos
    })
  }, [])

  const currentVideo = videos[currentIndex] || null
  const nextVideoToPreload = videos[currentIndex + 1] || null
  const currentVideoLikePending = currentVideo ? pendingLikeVideoIds.has(currentVideo.videoId) : false
  const currentVideoFavoritePending = currentVideo ? pendingFavoriteVideoIds.has(currentVideo.videoId) : false

  return {
    videos,
    currentVideo,
    nextVideoToPreload,
    currentVideoLikePending,
    currentVideoFavoritePending,
    currentIndex,
    loading,
    error,
    hasMore,
    nextVideo,
    prevVideo,
    toggleLike,
    toggleFavorite,
    updateCommentCount,
    loadMore,
    reload: () => loadFeed(DEFAULT_FEED_COUNT, false),
  }
}
