'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Video } from '@/src/types/video'

// Mock 数据
const mockMyVideos: Video[] = [
  { videoId: 'm1', title: '我的第一个视频', url: '', coverUrl: '', authorId: 'me', authorName: '我', likeCount: 100, createdAt: '2026-05-20T10:00:00' },
  { videoId: 'm2', title: '日常记录', url: '', coverUrl: '', authorId: 'me', authorName: '我', likeCount: 50, createdAt: '2026-05-19T15:00:00' },
]

export function MyVideoList() {
  const [videos, setVideos] = useState<Video[]>(mockMyVideos)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const handleDelete = async (videoId: string) => {
    if (!confirm('确定要删除这个视频吗？')) return
    
    // TODO: 替换为真实 API 调用
    // await deleteVideo(videoId)
    
    setVideos((prev) => prev.filter((v) => v.videoId !== videoId))
  }

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-gray-500">暂无视频</p>
      </div>
    )
  }

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

      {/* 分页 */}
      <div className="flex justify-center gap-2 pt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-black disabled:opacity-30"
        >
          上一页
        </button>
        <span className="px-4 py-2">第 {page} 页</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={videos.length < pageSize}
          className="px-4 py-2 border border-black disabled:opacity-30"
        >
          下一页
        </button>
      </div>
    </div>
  )
}
