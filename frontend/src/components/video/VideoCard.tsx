'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { Heart, Star, MessageCircle } from 'lucide-react'
import { Video } from '@/src/types/video'
import { CommentSection } from './CommentSection'

interface VideoCardProps {
  video: Video
  onLike: (videoId: string) => void | Promise<void>
  onFavorite: (videoId: string) => void | Promise<void>
  likePending?: boolean
  favoritePending?: boolean
  muted?: boolean
  onMuteChange?: (muted: boolean) => void
  isVisible?: boolean
}

function VideoCardInner({ video, onLike, onFavorite, likePending = false, favoritePending = false, muted = true, onMuteChange, isVisible = true }: VideoCardProps) {
  const videoUrl = video.videoUrl || video.url || ''
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // 视频可见性控制：仅当前视频播放
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    if (isVisible) {
      videoElement.muted = muted
      videoElement.play().catch((error) => {
        console.warn('Failed to autoplay video', { videoId: video.videoId, error })
      })
    } else {
      videoElement.pause()
    }
  }, [isVisible, video.videoId, muted])

  // 视频加载和事件监听
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !videoUrl) {
      return
    }

    videoElement.currentTime = 0
    if (isVisible) {
      videoElement.muted = muted
      const playPromise = videoElement.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Failed to autoplay video', { videoId: video.videoId, error })
        })
      }
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
  }, [video.videoId, videoUrl, isVisible, muted, onMuteChange])

  // 封面图懒加载
  const handleCoverLoad = () => {
    setCoverLoaded(true)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
      <div className="min-h-0 flex-1 w-full flex items-center justify-center bg-black">
        {videoUrl ? (
          <div className="relative w-full h-full">
            {/* 封面图（懒加载） */}
            {video.coverUrl && !coverLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <img
                  src={video.coverUrl}
                  alt=""
                  className="max-h-full max-w-full object-contain opacity-0"
                  onLoad={handleCoverLoad}
                  loading="lazy"
                />
              </div>
            )}
            <video
              ref={videoRef}
              key={video.videoId}
              src={videoUrl}
              poster={coverLoaded ? undefined : video.coverUrl}
              controls
              autoPlay
              loop
              playsInline
              preload={isVisible ? 'auto' : 'none'}
              className="h-full w-full object-contain bg-black"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">▶</div>
            <p className="text-sm text-white/70">暂无视频地址</p>
          </div>
        )}
      </div>

      {/* 视频信息和操作区 */}
      <div className="w-full bg-black/85">
        <div className="p-4">
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
              <button
                type="button"
                aria-label={showComments ? '收起评论' : '查看评论'}
                onClick={() => setShowComments(!showComments)}
                className="flex flex-col items-center p-2 border border-white/50 bg-black/50 hover:bg-white/15"
              >
                <MessageCircle className={`w-6 h-6 ${showComments ? 'fill-white' : ''}`} />
                <span className="text-xs mt-1">{video.commentCount ?? 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        {showComments && (
          <CommentSection videoId={video.videoId} commentCount={video.commentCount} />
        )}
      </div>
    </div>
  )
}

// 使用 React.memo 避免不必要的重渲染
export const VideoCard = memo(VideoCardInner, (prevProps, nextProps) => {
  // 自定义比较逻辑：只在新视频切换或交互状态变化时重渲染
  return (
    prevProps.video.videoId === nextProps.video.videoId &&
    prevProps.video.liked === nextProps.video.liked &&
    prevProps.video.favorited === nextProps.video.favorited &&
    prevProps.video.likeCount === nextProps.video.likeCount &&
    prevProps.video.favoriteCount === nextProps.video.favoriteCount &&
    prevProps.video.commentCount === nextProps.video.commentCount &&
    prevProps.likePending === nextProps.likePending &&
    prevProps.favoritePending === nextProps.favoritePending &&
    prevProps.muted === nextProps.muted &&
    prevProps.isVisible === nextProps.isVisible
  )
})
