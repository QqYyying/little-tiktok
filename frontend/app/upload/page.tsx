'use client'

import { useRouter } from 'next/navigation'
import { UploadVideo } from '@/src/components/my-videos'

export default function UploadPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6 pb-4 border-b border-black">
          发布视频
        </h1>
        <UploadVideo onSuccess={() => router.push('/my-videos')} />
      </div>
    </main>
  )
}
