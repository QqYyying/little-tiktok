'use client'

import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { getViewHistory, type ViewHistoryItem } from '@/src/api/video'

export function ViewHistoryList() {
  const [items, setItems] = useState<ViewHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      setLoading(true)
      setError('')
      try {
        const data = await getViewHistory()
        if (cancelled) return
        setItems(data.items)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : '加载浏览记录失败')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchHistory()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-gray-500">加载浏览记录中...</p>
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

  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-black">
        <p className="text-gray-500">暂无浏览记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={`${item.videoId}-${item.viewedAt ?? item.createdAt}`} className="border border-black p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-gray-600">@{item.authorName || item.authorId}</p>
              {item.description && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>点赞 {item.likeCount}</div>
              <div className="mt-2 flex items-center justify-end gap-1">
                <Clock3 className="w-3 h-3" />
                <span>{item.viewedAt ? new Date(item.viewedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
