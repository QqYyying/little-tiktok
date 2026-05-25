'use client'

import { useState } from 'react'
import { Video } from '@/src/types/video'
import { Heart, Star, Trash2 } from 'lucide-react'

// Mock 收藏数据
const mockFavorites: Video[] = [
  { videoId: '2', title: '城市夜景', url: '', coverUrl: '', authorId: 'u2', authorName: '小红', likeCount: 5678, favoriteCount: 200, liked: true, favorited: true, createdAt: '2026-05-19T15:00:00' },
  { videoId: '4', title: '旅行日记', url: '', coverUrl: '', authorId: 'u1', authorName: '小明', likeCount: 8901, favoriteCount: 500, liked: false, favorited: true, createdAt: '2026-05-17T08:00:00' },
]

interface FavoriteListProps {
  onUnfavorite?: (videoId: string) => void
}

export function FavoriteList({ onUnfavorite }: FavoriteListProps) {
  const [favorites, setFavorites] = useState<Video[]>(mockFavorites)

  const handleUnfavorite = (videoId: string) => {
    setFavorites((prev) => prev.filter((v) => v.videoId !== videoId))
    onUnfavorite?.(videoId)
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无收藏
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {favorites.map((video) => (
        <div key={video.videoId} className="border border-black p-4 flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-bold">{video.title}</h3>
            <p className="text-sm text-gray-600">@{video.authorName}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {video.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {video.favoriteCount}
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
    </div>
  )
}
