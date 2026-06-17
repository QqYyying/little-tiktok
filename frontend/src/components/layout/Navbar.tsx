'use client'

import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import { logout as logoutApi } from '@/src/api/user'
import { BarChart3, Home, User, Upload, LogOut, LogIn } from 'lucide-react'

function loginRedirect(path: string) {
  return `/login?redirect=${encodeURIComponent(path)}`
}

export function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth()

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

        <Link
          href={isAuthenticated ? '/upload' : loginRedirect('/upload')}
          className="flex flex-col items-center text-xs"
        >
          <Upload className="w-6 h-6" />
          <span>发布</span>
        </Link>

        <Link
          href={isAuthenticated ? '/my-videos' : loginRedirect('/my-videos')}
          className="flex flex-col items-center text-xs"
        >
          <User className="w-6 h-6" />
          <span>我的</span>
        </Link>

        {isAdmin && (
          <Link href="/admin" className="flex flex-col items-center text-xs">
            <BarChart3 className="w-6 h-6" />
            <span>后台</span>
          </Link>
        )}

        {isAuthenticated ? (
          <button onClick={handleLogout} className="flex flex-col items-center text-xs">
            <LogOut className="w-6 h-6" />
            <span>退出</span>
          </button>
        ) : (
          <Link href="/login" className="flex flex-col items-center text-xs">
            <LogIn className="w-6 h-6" />
            <span>登录</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
