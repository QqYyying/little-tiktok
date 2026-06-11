'use client'

import { VideoFeed } from '@/src/components/video'

export default function HomePage() {
  return (
    <main className="relative h-[calc(100dvh-64px)] overflow-hidden bg-black">
      <VideoFeed />
    </main>
  )
}
