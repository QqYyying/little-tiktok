'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { getLikedVideos, type VideoRecord } from '@/src/api/video'

export function LikedVideoList() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pageSize = 10

  useEffect(() => {
    let cancelled = false

    async function fetchVideos() {
      setLoading(true)
      setError('')
      try {
        const data = await getLikedVideos(page, pageSize)
        if (cancelled) return
        setVideos(data.records)
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

    void fetchVideos()
    return () => {
      cancelled = true
    }
  }, [page])

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
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无点赞的视频</p>
        <p className="text-sm text-gray-400 mt-2">快去点赞喜欢的视频吧！</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-4 space-y-4">
      {videos.map((video) => (
        <div
          key={video.videoId}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex-shrink-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                {video.likeCount}
              </span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
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
    </div>
  )
}