'use client'

import { useState } from 'react'
import { useAuth } from '@/src/hooks/useAuth'

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // TODO: 替换为真实 API 调用
    // const res = await loginApi({ username, password })
    
    // Mock 登录
    setTimeout(() => {
      if (username && password) {
        login('mock_token_' + Date.now(), {
          userId: 'u_' + Date.now(),
          username,
        })
        onSuccess?.()
      } else {
        setError('请输入用户名和密码')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">用户名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-black"
          placeholder="请输入用户名"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-black"
          placeholder="请输入密码"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 border border-black hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
