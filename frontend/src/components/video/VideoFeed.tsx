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
    currentIndex,
    videos,
    nextVideo,
    prevVideo,
    toggleLike,
    toggleFavorite,
    loading,
    error,
    hasMore,
    reload,
  } = useVideoFeed()
  const wheelLockedRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < videos.length - 1

  const navigateToPrev = useCallback(() => {
    if (!canGoPrev) {
      return
    }

    prevVideo()
  }, [canGoPrev, prevVideo])

  const navigateToNext = useCallback(() => {
    if (!canGoNext) {
      return
    }

    nextVideo()
  }, [canGoNext, nextVideo])

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
      <div className="h-full flex items-center justify-center border border-black">
        <p>加载推荐视频中...</p>
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 border border-black p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={reload} className="px-4 py-2 border border-black hover:bg-gray-100">
          重试
        </button>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center border border-black">
        <p>暂无更多视频</p>
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col"
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-500">
        {currentIndex + 1} / {videos.length}
      </div>

      <button
        onClick={navigateToPrev}
        disabled={!canGoPrev}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-10 p-2 border border-black bg-white disabled:opacity-30"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      <div className="flex-1 relative">
        <VideoCard video={currentVideo} onLike={toggleLike} onFavorite={toggleFavorite} />
      </div>

      <button
        onClick={navigateToNext}
        disabled={!canGoNext && !hasMore}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 p-2 border border-black bg-white disabled:opacity-30"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs">
          加载中...
        </div>
      )}

      {error && videos.length > 0 && (
        <div className="absolute bottom-4 right-4 max-w-xs border border-red-300 bg-white px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
