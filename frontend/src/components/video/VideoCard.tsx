'use client'

import { useEffect, useRef } from 'react'
import { Heart, Star } from 'lucide-react'
import { Video } from '@/src/types/video'

interface VideoCardProps {
  video: Video
  onLike: (videoId: string) => void | Promise<void>
  onFavorite: (videoId: string) => void | Promise<void>
  likePending?: boolean
  favoritePending?: boolean
  muted?: boolean
  onMuteChange?: (muted: boolean) => void
}

export function VideoCard({ video, onLike, onFavorite, likePending = false, favoritePending = false, muted = true, onMuteChange }: VideoCardProps) {
  const videoUrl = video.videoUrl || video.url || ''
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !videoUrl) {
      return
    }

    videoElement.currentTime = 0
    videoElement.muted = muted
    const playPromise = videoElement.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Failed to autoplay video', { videoId: video.videoId, error })
      })
    }

    const handleVolumeChange = () => {
      if (onMuteChange) {
        onMuteChange(videoElement.muted)
      }
    }

    videoElement.addEventListener('volumechange', handleVolumeChange)

    return () => {
      videoElement.removeEventListener('volumechange', handleVolumeChange)
      videoElement.pause()
    }
  }, [video.videoId, videoUrl, muted, onMuteChange])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
      <div className="min-h-0 flex-1 w-full flex items-center justify-center bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            key={video.videoId}
            src={videoUrl}
            poster={video.coverUrl}
            controls
            autoPlay
            loop
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">▶</div>
            <p className="text-sm text-white/70">暂无视频地址</p>
          </div>
        )}
      </div>

      <div className="w-full p-4 bg-black/85">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{video.title}</h3>
            <p className="text-sm text-white/70">@{video.authorName}</p>
            {video.description && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2">{video.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={video.liked ? '取消点赞' : '点赞'}
              disabled={likePending}
              onClick={() => void onLike(video.videoId)}
              className="flex flex-col items-center p-2 border border-white/50 bg-black/50 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Heart className={`w-6 h-6 ${video.liked ? 'fill-white' : ''}`} />
              <span className="text-xs mt-1">{video.likeCount}</span>
            </button>
            <button
              type="button"
              aria-label={video.favorited ? '取消收藏' : '收藏'}
              disabled={favoritePending}
              onClick={() => void onFavorite(video.videoId)}
              className="flex flex-col items-center p-2 border border-white/50 bg-black/50 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star className={`w-6 h-6 ${video.favorited ? 'fill-white' : ''}`} />
              <span className="text-xs mt-1">{video.favoriteCount ?? 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
