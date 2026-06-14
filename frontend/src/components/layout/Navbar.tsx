'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { logout as logoutApi } from '@/src/api/user'
import { Home, User, Upload, LogOut } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState(pathname)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore remote logout failures and clear local session anyway.
    } finally {
      logout()
    }
  }

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/upload', icon: Upload, label: '发布', auth: true },
    { path: '/my-videos', icon: User, label: '我的', auth: true },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-around py-2 px-4">
        {navItems.map(({ path, icon: Icon, label, auth }) => {
          if (auth && !isAuthenticated) return null
          
          const active = isActive(path)
          
          return (
            <Link
              key={path}
              href={path}
              onClick={() => setActiveItem(path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ease-out ${
                active
                  ? 'text-blue-500 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`relative transition-all duration-300 ${active ? 'scale-110' : ''}`}>
                <Icon className={`w-6 h-6 transition-all duration-300 ${active ? 'drop-shadow-[0_2px_4px_rgba(59,130,246,0.4)]' : ''}`} />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
        
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300 ease-out"
          >
            <div className="relative">
              <LogOut className="w-6 h-6 transition-all duration-300 hover:rotate-180" />
            </div>
            <span className="text-xs font-medium">退出</span>
          </button>
        )}
      </div>
    </nav>
  )
}
