'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useVideoFeed } from '@/src/hooks/useVideoFeed'
import { VideoCard } from './VideoCard'

const WHEEL_NAVIGATION_LOCK_MS = 400
const TOUCH_SWIPE_THRESHOLD = 50

export function VideoFeed() {
  const {
    currentVideo,
    nextVideoToPreload,
    currentVideoLikePending,
    currentVideoFavoritePending,
    currentIndex,
    videos,
    nextVideo,
    prevVideo,
    toggleLike,
    toggleFavorite,
    loading,
    error,
    reload,
  } = useVideoFeed()
  const wheelLockedRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)
  const canGoPrev = currentIndex > 0

  const navigateToPrev = useCallback(() => {
    if (!canGoPrev) {
      return
    }

    prevVideo()
  }, [canGoPrev, prevVideo])

  const navigateToNext = useCallback(() => {
    if (videos.length === 0) {
      return
    }

    void nextVideo()
  }, [nextVideo, videos.length])

  const handleWheelNavigation = useCallback((deltaY: number) => {
    if (videos.length === 0 || deltaY === 0 || wheelLockedRef.current) {
      return
    }

    wheelLockedRef.current = true
    window.setTimeout(() => {
      wheelLockedRef.current = false
    }, WHEEL_NAVIGATION_LOCK_MS)

    if (deltaY > 0) {
      navigateToNext()
      return
    }

    navigateToPrev()
  }, [navigateToNext, navigateToPrev, videos.length])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      const isEditable = Boolean(target?.isContentEditable)

      if (isEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        navigateToNext()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        navigateToPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateToNext, navigateToPrev])

  if (loading && videos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <p>加载推荐视频中...</p>
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-black p-6 text-center text-white">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="px-4 py-2 border border-white/70 hover:bg-white/15"
        >
          重试
        </button>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <p>暂无更多视频</p>
      </div>
    )
  }

  return (
    <div
      className="relative h-full overflow-hidden bg-black text-white"
      onWheel={(event) => handleWheelNavigation(event.deltaY)}
      onTouchStart={(event) => {
        touchStartYRef.current = event.touches[0]?.clientY ?? null
      }}
      onTouchEnd={(event) => {
        const touchStartY = touchStartYRef.current
        const touchEndY = event.changedTouches[0]?.clientY ?? null

        touchStartYRef.current = null

        if (touchStartY === null || touchEndY === null) {
          return
        }

        const deltaY = touchStartY - touchEndY
        if (Math.abs(deltaY) < TOUCH_SWIPE_THRESHOLD) {
          return
        }

        if (deltaY > 0) {
          navigateToNext()
          return
        }

        navigateToPrev()
      }}
    >
      <button
        type="button"
        aria-label="上一个视频"
        onClick={navigateToPrev}
        disabled={!canGoPrev}
        className="absolute top-14 left-1/2 -translate-x-1/2 z-10 p-2 border border-white/60 bg-black/50 text-white hover:bg-white/15 disabled:opacity-30"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <div className="h-full">
        <VideoCard
          video={currentVideo}
          onLike={toggleLike}
          onFavorite={toggleFavorite}
          likePending={currentVideoLikePending}
          favoritePending={currentVideoFavoritePending}
        />
      </div>

      {nextVideoToPreload && (nextVideoToPreload.videoUrl || nextVideoToPreload.url) && (
        <video
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          muted
          playsInline
          preload="auto"
          src={nextVideoToPreload.videoUrl || nextVideoToPreload.url}
        />
      )}

      <button
        type="button"
        aria-label="下一个视频"
        onClick={navigateToNext}
        disabled={videos.length === 0}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 p-2 border border-white/60 bg-black/50 text-white hover:bg-white/15 disabled:opacity-30"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white/80">
          加载中...
        </div>
      )}

      {error && videos.length > 0 && (
        <div className="absolute bottom-4 right-4 max-w-xs border border-red-300 bg-black/80 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
