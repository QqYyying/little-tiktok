'use client'

import { useRef, useState } from 'react'
import { Upload, X, Image, PlayCircle } from 'lucide-react'
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
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* 视频标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">视频标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
          placeholder="请输入视频标题"
        />
      </div>

      {/* 视频描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">视频描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50 resize-none"
          placeholder="补充一点视频说明（可选）"
          rows={3}
        />
      </div>

      {/* 选择视频 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">选择视频</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50'
          }`}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">点击选择视频文件</p>
              <p className="text-xs text-gray-500">支持 MP4, MOV, AVI, WebM 格式</p>
            </div>
          )}
        </div>
      </div>

      {/* 可选封面 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">封面图片（可选）</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <div
          onClick={() => coverInputRef.current?.click()}
          className={`relative w-full p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            coverFile
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {coverFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{coverFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(coverFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCoverFile(null)
                }}
                className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Image className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-700">点击上传封面图片</p>
              <p className="text-xs text-gray-500">支持 PNG, JPG, WebP 格式</p>
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 发布按钮 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            上传中...
          </span>
        ) : (
          '发布视频'
        )}
      </button>
    </form>
  )
}
