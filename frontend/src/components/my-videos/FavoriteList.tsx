'use client'

import { useEffect, useState } from 'react'
import { Heart, Trash2 } from 'lucide-react'
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

  const handleUnfavorite = async (videoId: string) => {
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
        <p className="text-gray-500">暂无收藏</p>
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div key={video.videoId} className="border border-black p-4 flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-bold">{video.title}</h3>
            <p className="text-sm text-gray-600">@{video.authorName}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {video.likeCount}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleUnfavorite(video.videoId)}
            className="p-2 border border-black hover:bg-gray-100"
            title="取消收藏"
          >
            <Trash2 className="w-4 h-4" />
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