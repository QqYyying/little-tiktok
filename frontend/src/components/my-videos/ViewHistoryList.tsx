'use client'

import { useEffect, useState } from 'react'
import { Clock3, Heart, Calendar, X } from 'lucide-react'
import { getViewHistory, type ViewHistoryItem } from '@/src/api/video'
import { PaginationControls } from './PaginationControls'

export function ViewHistoryList() {
  const [items, setItems] = useState<ViewHistoryItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<ViewHistoryItem | null>(null)
  const pageSize = 10

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

  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      setLoading(true)
      setError('')
      try {
        const data = await getViewHistory()
        if (cancelled) return
        setItems(data.items)
        setPage(1)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载浏览记录失败')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchHistory()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-gray-500">加载浏览记录中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock3 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无浏览记录</p>
        <p className="text-sm text-gray-400 mt-2">快去浏览视频吧！</p>
      </div>
    )
  }

  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="p-4 space-y-4">
      {pagedItems.map((item) => (
        <div
          key={`${item.videoId}-${item.viewedAt ?? item.createdAt}`}
          onClick={() => setSelectedVideo(item)}
          className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">@{item.authorName || item.authorId}</p>
              {item.description && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-400">
              <div className="flex items-center justify-end gap-1">
                <Clock3 className="w-3 h-3" />
                <span>{item.viewedAt ? new Date(item.viewedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <PaginationControls page={page} pageSize={pageSize} total={items.length} onPageChange={setPage} />

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
