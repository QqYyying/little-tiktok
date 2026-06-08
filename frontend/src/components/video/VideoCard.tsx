'use client'

import { Heart, Star } from 'lucide-react'
import { Video } from '@/src/types/video'

interface VideoCardProps {
  video: Video
  onLike: (videoId: string) => void | Promise<void>
  onFavorite: (videoId: string) => void
}

export function VideoCard({ video, onLike, onFavorite }: VideoCardProps) {
  const videoUrl = video.videoUrl || video.url || ''

  return (
    <div className="w-full h-full flex flex-col items-center justify-center border border-black bg-white">
      <div className="flex-1 w-full flex items-center justify-center bg-gray-100 border-b border-black">
        {videoUrl ? (
          <video
            key={video.videoId}
            src={videoUrl}
            poster={video.coverUrl}
            controls
            autoPlay
            muted
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">▶</div>
            <p className="text-sm text-gray-500">暂无视频地址</p>
          </div>
        )}
      </div>

      <div className="w-full p-4 border-t border-black">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{video.title}</h3>
            <p className="text-sm text-gray-600">@{video.authorName}</p>
            {video.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{video.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void onLike(video.videoId)}
              className="flex flex-col items-center p-2 border border-black hover:bg-gray-100"
            >
              <Heart className={`w-6 h-6 ${video.liked ? 'fill-black' : ''}`} />
              <span className="text-xs mt-1">{video.likeCount}</span>
            </button>
            <button
              onClick={() => onFavorite(video.videoId)}
              className="flex flex-col items-center p-2 border border-black hover:bg-gray-100"
            >
              <Star className={`w-6 h-6 ${video.favorited ? 'fill-black' : ''}`} />
              <span className="text-xs mt-1">{video.favoriteCount ?? 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
