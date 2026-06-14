'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { UploadVideo } from '@/src/components/my-videos'

export default function UploadPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">发布视频</h1>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <UploadVideo onSuccess={() => router.push('/my-videos')} />
        </div>
      </div>
    </main>
  )
}
