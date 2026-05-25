'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm, RegisterForm } from '@/src/components/auth'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-black p-6">
        <h1 className="text-xl font-bold text-center mb-6">
          {mode === 'login' ? '登录' : '注册'}
        </h1>

        {mode === 'login' ? (
          <LoginForm onSuccess={() => router.push('/')} />
        ) : (
          <RegisterForm onSuccess={() => setMode('login')} />
        )}

        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="underline">
              没有账号？去注册
            </button>
          ) : (
            <button onClick={() => setMode('login')} className="underline">
              已有账号？去登录
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
