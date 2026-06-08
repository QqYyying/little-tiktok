'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { uploadVideo } from '@/src/api/video'

export function UploadVideo({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !file) {
      setError('请填写标题并选择视频文件')
      return
    }

    setLoading(true)
    try {
      await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        file,
        coverFile,
      })
      setTitle('')
      setDescription('')
      setFile(null)
      setCoverFile(null)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setLoading(false)
    }
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
        <label className="block text-sm mb-1">视频描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-black min-h-24"
          placeholder="可选，补充一点视频说明"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">选择视频</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-4 border border-dashed border-black hover:bg-gray-50 flex flex-col items-center"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm">{file ? file.name : '点击选择视频文件'}</span>
        </button>
      </div>

      <div>
        <label className="block text-sm mb-1">可选封面</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="w-full p-4 border border-dashed border-black hover:bg-gray-50 flex flex-col items-center"
        >
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm">{coverFile ? coverFile.name : '点击上传封面图片'}</span>
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
