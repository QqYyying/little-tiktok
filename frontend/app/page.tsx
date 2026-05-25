'use client'

import { VideoFeed } from '@/src/components/video'

export default function HomePage() {
  return (
    <main className="h-[calc(100vh-64px)] relative">
      <VideoFeed />
    </main>
  )
}
