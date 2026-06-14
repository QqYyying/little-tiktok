'use client'

import { useState } from 'react'
import { Video, Heart, Star, History } from 'lucide-react'
import { FavoriteList, LikedVideoList, MyVideoList, ViewHistoryList } from '@/src/components/my-videos'

type Tab = 'videos' | 'liked' | 'favorites' | 'history'

const tabs: { key: Tab; label: string; icon: typeof Video }[] = [
  { key: 'videos', label: '我的视频', icon: Video },
  { key: 'liked', label: '我喜欢的', icon: Heart },
  { key: 'favorites', label: '我的收藏', icon: Star },
  { key: 'history', label: '浏览记录', icon: History },
]

export default function MyVideosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('videos')

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部用户信息区域 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">用户</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">我的账号</h2>
              <p className="text-sm text-gray-500">欢迎回来！</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-md mx-auto px-4 py-4">
        {/* 标签页 */}
        <div className="flex bg-gray-100 rounded-2xl p-1 shadow-sm mb-4">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 ${
                activeTab === key
                  ? 'bg-white text-blue-600 shadow-md font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {activeTab === 'videos' && <MyVideoList />}
          {activeTab === 'liked' && <LikedVideoList />}
          {activeTab === 'favorites' && <FavoriteList />}
          {activeTab === 'history' && <ViewHistoryList />}
        </div>
      </div>
    </main>
  )
}
