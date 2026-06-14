'use client'

import { useEffect, useState } from 'react'
import { Heart, Star, Trash2, Calendar, X } from 'lucide-react'
import { getFavorites, unfavoriteVideo } from '@/src/api/favorite'
import { type MyVideosPageData } from '@/src/api/video'
import { resolveMediaUrl } from '@/src/utils/media'

interface VideoRecord {
  videoId: string
  authorId: string
  authorName?: string
  title: string
  description: string
  videoUrl: string
  coverUrl: string
  likeCount: number
  status: string
  createdAt: string
  updatedAt?: string
}

export function FavoriteList() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
  const pageSize = 10

  useEffect(() => {
    let cancelled = false

    async function fetchFavorites() {
      setLoading(true)
      setError('')
      try {
        const data: MyVideosPageData = await getFavorites(page, pageSize)
        if (cancelled) return
        const normalizedRecords = data.records.map((record) => ({
          ...record,
          videoUrl: resolveMediaUrl(record.videoUrl),
          coverUrl: resolveMediaUrl(record.coverUrl),
        }))
        setVideos(normalizedRecords)
        setTotal(data.total)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchFavorites()
    return () => {
      cancelled = true
    }
  }, [page])

  const handleUnfavorite = async (videoId: string, event?: React.MouseEvent) => {
    event?.stopPropagation()
    if (!window.confirm('确定要取消收藏这个视频吗？')) {
      return
    }

    try {
      await unfavoriteVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.videoId !== videoId))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消收藏失败')
    }
  }

  useEffect(() => {
    if (!selectedVideo) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedVideo])

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => setPage(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无收藏</p>
        <p className="text-sm text-gray-400 mt-2">快去收藏喜欢的视频吧！</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-4 space-y-4">
      {videos.map((video) => (
        <div
          key={video.videoId}
          onClick={() => setSelectedVideo(video)}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex-shrink-0 flex items-center justify-center">
            <Star className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
            <p className="text-sm text-gray-500">@{video.authorName}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Heart className="w-3 h-3" />
              {video.likeCount}
            </div>
          </div>
          <button
            onClick={(e) => handleUnfavorite(video.videoId, e)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            title="取消收藏"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        <span className="text-sm text-gray-500">第 {page} 页 / 共 {totalPages} 页</span>
        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>

      {/* 视频播放弹窗 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 视频播放器 */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={selectedVideo.coverUrl}
              />
            </div>

            {/* 视频信息 */}
            <div className="p-4 bg-black/90">
              <h3 className="text-white font-semibold text-lg">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-white/70 text-sm mt-1">{selectedVideo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {selectedVideo.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedVideo.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}