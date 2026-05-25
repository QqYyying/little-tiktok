'use client'

import { useState } from 'react'

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }

    setLoading(true)

    // TODO: 替换为真实 API 调用
    // const res = await registerApi({ username, password })
    
    // Mock 注册
    setTimeout(() => {
      if (username && password) {
        onSuccess?.()
      } else {
        setError('请填写完整信息')
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
      <div>
        <label className="block text-sm mb-1">确认密码</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border border-black"
          placeholder="再次输入密码"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 border border-black hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  )
}
