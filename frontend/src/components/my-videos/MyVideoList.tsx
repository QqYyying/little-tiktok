'use client'

import { useEffect, useState } from 'react'
import { Trash2, Heart, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { deleteVideo, getMyVideos, type VideoRecord } from '@/src/api/video'

export function MyVideoList() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const pageSize = 6

  useEffect(() => {
    let cancelled = false

    async function fetchVideos() {
      setLoading(true)
      setError('')
      try {
        const data = await getMyVideos(page, pageSize)
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

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('确定要删除这个视频吗？')) {
      return
    }

    setDeletingId(videoId)
    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.videoId !== videoId))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

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
          <VideoIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无视频</p>
        <p className="text-sm text-gray-400 mt-2">快去发布你的第一个视频吧！</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="p-4">
      {/* 视频列表 */}
      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.videoId}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* 视频缩略图 */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex-shrink-0 flex items-center justify-center">
              <PlayCircleMini className="w-8 h-8 text-blue-500" />
            </div>

            {/* 视频信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {video.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {video.favoriteCount ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 删除按钮 */}
            <button
              onClick={() => handleDelete(video.videoId)}
              disabled={deletingId === video.videoId}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
              title="删除视频"
            >
              {deletingId === video.videoId ? (
                <div className="w-4 h-4 inline-block animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {totalPages > 5 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </div>

          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

// 辅助图标组件
function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 10 4.553-2.276A1 1 0 0 0 20 8.618v6.764a1 1 0 0 0-1.447.894L15 14v-4Z" />
      <path d="m2 8 5.586-3.057A1 1 0 0 1 9 6.34V17.66a1 1 0 0 1-1.414.893L2 16v-8Z" />
      <path d="M2 12h20" />
    </svg>
  )
}

function PlayCircleMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 15 5-3-5-3v6Z" />
    </svg>
  )
}
