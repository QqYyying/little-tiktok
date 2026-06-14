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
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-gray-500">加载浏览记录中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock3 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">暂无浏览记录</p>
        <p className="text-sm text-gray-400 mt-2">快去浏览视频吧！</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {items.map((item) => (
        <div key={`${item.videoId}-${item.viewedAt ?? item.createdAt}`} className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">@{item.authorName || item.authorId}</p>
              {item.description && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-400">
              <div className="flex items-center justify-end gap-1">
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
