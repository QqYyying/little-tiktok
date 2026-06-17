'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { useAuth } from '@/src/hooks/useAuth'
import { Comment, createComment, getComments, likeComment, unlikeComment } from '@/src/api/comment'

interface CommentSectionProps {
  videoId: string
  commentCount?: number
  onCommentCountChange?: (count: number) => void
}

export function CommentSection({ videoId, commentCount = 0, onCommentCountChange }: CommentSectionProps) {
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(commentCount)
  const totalRef = useRef(commentCount)

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getComments(videoId, page)
      setComments((prev) => (page === 1 ? result.items : [...prev, ...result.items]))
      totalRef.current = result.total
      setTotal(result.total)
      onCommentCountChange?.(result.total)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }, [onCommentCountChange, page, videoId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  useEffect(() => {
    setPage(1)
    setComments([])
    totalRef.current = commentCount
    setTotal(commentCount)
  }, [commentCount, onCommentCountChange, videoId])

  const handleSubmit = async () => {
    if (authLoading) {
      return
    }
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    const content = newComment.trim()
    if (!content) {
      return
    }

    try {
      const comment = await createComment(videoId, { content })
      setComments((prev) => [comment, ...prev])
      setNewComment('')
      const nextTotal = totalRef.current + 1
      totalRef.current = nextTotal
      setTotal(nextTotal)
      onCommentCountChange?.(nextTotal)
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleLike = async (commentId: string) => {
    if (authLoading) {
      return
    }
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    const comment = comments.find((item) => item.id === commentId)
    if (!comment) {
      return
    }

    try {
      if (comment.liked) {
        await unlikeComment(commentId)
        setComments((prev) =>
          prev.map((item) =>
            item.id === commentId
              ? { ...item, liked: false, likeCount: Math.max(0, item.likeCount - 1) }
              : item
          )
        )
        return
      }

      await likeComment(commentId)
      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId
            ? { ...item, liked: true, likeCount: item.likeCount + 1 }
            : item
        )
      )
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div
      data-comment-scroll
      className="bg-black/50 rounded-t-2xl p-4"
      onWheel={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="text-white font-medium">{total} 条评论</span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <input
          type="text"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSubmit()
            }
          }}
          placeholder={isAuthenticated ? '说点什么...' : '登录后可以发表评论'}
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={authLoading || !newComment.trim()}
          className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {!isAuthenticated && (
        <button
          type="button"
          onClick={() => requireAuth()}
          className="mb-4 text-xs text-white/60 underline underline-offset-4 hover:text-white"
        >
          登录后可以发评论和点赞评论
        </button>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto overscroll-contain">
        {loading && page === 1 && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-white/50 text-center py-4">暂无评论</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {comment.username.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-white font-medium text-sm">{comment.username}</span>
                {comment.replyToUsername && (
                  <span className="text-gray-400 text-xs">回复 @{comment.replyToUsername}</span>
                )}
              </div>
              <p className="text-white text-sm mt-1">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-white/50">{formatTime(comment.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => void handleLike(comment.id)}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-red-400 transition-colors"
                >
                  <Heart className={`w-3 h-3 ${comment.liked ? 'fill-red-400 text-red-400' : ''}`} />
                  <span>{comment.likeCount}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && comments.length < total && (
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          className="w-full mt-4 py-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          加载更多评论
        </button>
      )}
    </div>
  )
}
