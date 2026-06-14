'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/src/hooks/useAuth'
import { logout as logoutApi } from '@/src/api/user'
import { Home, User, Upload, LogOut } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

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
    { href: '/', icon: Home, label: '首页' },
    { href: '/upload', icon: Upload, label: '发布' },
    { href: '/my-videos', icon: User, label: '我的' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
                active
                  ? 'text-blue-600 scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:scale-102'
              }`}
            >
              {/* 选中指示器 */}
              {active && (
                <div className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              )}
              <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-blue-50' : ''}`}>
                <Icon className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-xs mt-1 font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* 退出按钮 */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-4 rounded-xl text-gray-500 hover:text-red-500 hover:scale-102 transition-all duration-300"
            title="退出登录"
          >
            <div className="p-2 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1">退出</span>
          </button>
        )}
      </div>
    </nav>
  )
}
