'use client'

import { useEffect, useState } from 'react'
import { Trash2, Heart, Star, Calendar, Video, X } from 'lucide-react'
import { deleteVideo, getMyVideos, type VideoRecord } from '@/src/api/video'
import { PaginationControls } from './PaginationControls'

export function MyVideoList() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null)
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

  const handleDelete = async (videoId: string, event?: React.MouseEvent) => {
    event?.stopPropagation()
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
          <Video className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无视频</p>
        <p className="text-sm text-gray-400 mt-2">快去发布你的第一个视频吧！</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* 视频列表 */}
      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.videoId}
            onClick={() => setSelectedVideo(video)}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
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
              onClick={(e) => handleDelete(video.videoId, e)}
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

      <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

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
                  <Star className="w-4 h-4" />
                  {selectedVideo.favoriteCount ?? 0}
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

// 辅助图标组件
function PlayCircleMini(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 15 5-3-5-3v6Z" />
    </svg>
  )
}
