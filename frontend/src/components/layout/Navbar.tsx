'use client'

import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { logout as logoutApi } from '@/src/api/user'
import { Home, User, Upload, LogOut } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore remote logout failures and clear local session anyway.
    } finally {
      logout()
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black z-50">
      <div className="max-w-md mx-auto flex justify-around py-3">
        <Link href="/" className="flex flex-col items-center text-xs">
          <Home className="w-6 h-6" />
          <span>首页</span>
        </Link>

        {isAuthenticated ? (
          <>
            <Link href="/upload" className="flex flex-col items-center text-xs">
              <Upload className="w-6 h-6" />
              <span>发布</span>
            </Link>
            <Link href="/my-videos" className="flex flex-col items-center text-xs">
              <User className="w-6 h-6" />
              <span>我的</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-col items-center text-xs">
              <LogOut className="w-6 h-6" />
              <span>退出</span>
            </button>
          </>
        ) : (
          <Link href="/login" className="flex flex-col items-center text-xs">
            <User className="w-6 h-6" />
            <span>登录</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
