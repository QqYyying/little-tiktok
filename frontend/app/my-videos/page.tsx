'use client'

import { useState } from 'react'
import { MyVideoList, FavoriteList } from '@/src/components/my-videos'

type Tab = 'videos' | 'favorites'

export default function MyVideosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('videos')

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">我的</h1>

        {/* Tab 切换 */}
        <div className="flex border-b border-black mb-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-2 text-center ${activeTab === 'videos' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            我的视频
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 text-center ${activeTab === 'favorites' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
          >
            我的收藏
          </button>
        </div>

        {/* Tab 内容 */}
        {activeTab === 'videos' ? <MyVideoList /> : <FavoriteList />}
      </div>
    </main>
  )
}
