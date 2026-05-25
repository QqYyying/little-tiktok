'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

export function UploadVideo({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !file) {
      setError('请填写标题并选择视频文件')
      return
    }

    setLoading(true)

    // TODO: 替换为真实 API 调用
    // const res = await uploadVideo({ title, file })
    
    // Mock 上传
    setTimeout(() => {
      setLoading(false)
      setTitle('')
      setFile(null)
      onSuccess?.()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">视频标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-black"
          placeholder="请输入视频标题"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">选择视频</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border border-dashed border-black hover:bg-gray-50 flex flex-col items-center"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm">
            {file ? file.name : '点击选择视频文件'}
          </span>
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 border border-black hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? '上传中...' : '发布视频'}
      </button>
    </form>
  )
}
