'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/src/hooks/useAuth'
import { Navbar } from './Navbar'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen pb-16">
        {children}
        <Navbar />
      </div>
    </AuthProvider>
  )
}
