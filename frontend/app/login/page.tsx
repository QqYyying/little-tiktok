'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm, RegisterForm } from '@/src/components/auth'
import { Video, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const redirect = searchParams.get('redirect')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 登录/注册卡片 */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* 顶部装饰条 */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />

        {/* Logo区域 */}
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Little TikTok</h1>
          <p className="text-sm text-gray-500 mt-1">分享你的精彩瞬间</p>
        </div>

        {/* 标签切换 */}
        <div className="flex px-6 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LogIn className="w-4 h-4" />
            登录
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            注册
          </button>
        </div>

        {/* 表单区域 */}
        <div className="px-6 pb-8">
          {mode === 'login' ? (
            <LoginForm onSuccess={() => {
              router.push(redirect?.startsWith('/') ? redirect : '/')
            }} />
          ) : (
            <RegisterForm onSuccess={() => setMode('login')} />
          )}
        </div>
      </div>
    </main>
  )
}
