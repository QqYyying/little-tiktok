'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { useVideoFeed } from '@/src/hooks/useVideoFeed'
import { VideoCard } from './VideoCard'

export function VideoFeed() {
  const { currentVideo, currentIndex, videos, nextVideo, prevVideo, toggleLike, toggleFavorite, loading } = useVideoFeed()

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center border border-black">
        <p>暂无视频</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 滑动提示 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-500">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* 上滑按钮 */}
      <button
        onClick={prevVideo}
        disabled={currentIndex === 0}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-10 p-2 border border-black bg-white disabled:opacity-30"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      {/* 视频卡片 */}
      <div className="flex-1 relative">
        <VideoCard video={currentVideo} onLike={toggleLike} onFavorite={toggleFavorite} />
      </div>

      {/* 下滑按钮 */}
      <button
        onClick={nextVideo}
        disabled={currentIndex === videos.length - 1}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 p-2 border border-black bg-white disabled:opacity-30"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

      {loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs">
          加载中...
        </div>
      )}
    </div>
  )
}
