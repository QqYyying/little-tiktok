'use client'

import { useState } from 'react'
import { FavoriteList, LikedVideoList, MyVideoList, ViewHistoryList } from '@/src/components/my-videos'

type Tab = 'videos' | 'liked' | 'favorites' | 'history'

export default function MyVideosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('videos')

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">我的</h1>

        <div className="flex border-b border-black mb-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-2 text-center ${activeTab === 'videos' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            我的视频
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-2 text-center ${activeTab === 'liked' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            我喜欢的
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 text-center ${activeTab === 'favorites' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            我的收藏
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-center ${activeTab === 'history' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            浏览记录
          </button>
        </div>

        {activeTab === 'videos' && <MyVideoList />}
        {activeTab === 'liked' && <LikedVideoList />}
        {activeTab === 'favorites' && <FavoriteList />}
        {activeTab === 'history' && <ViewHistoryList />}
      </div>
    </main>
  )
}
