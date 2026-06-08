'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteVideo, getMyVideos, type VideoRecord } from '@/src/api/video'

export function MyVideoList() {
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

    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.videoId !== videoId))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-gray-500">暂无视频</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.videoId}
          className="flex items-center justify-between p-4 border border-black"
        >
          <div className="flex-1">
            <h3 className="font-bold">{video.title}</h3>
            <div className="text-sm text-gray-500">
              <span>点赞: {video.likeCount}</span>
              <span className="mx-2">|</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(video.videoId)}
            className="p-2 border border-black hover:bg-gray-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}

      <div className="flex justify-center gap-2 pt-4">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-black disabled:opacity-30"
        >
          上一页
        </button>
        <span className="px-4 py-2">第 {page} 页 / 共 {totalPages} 页</span>
        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 border border-black disabled:opacity-30"
        >
          下一页
        </button>
      </div>
    </div>
  )
}
