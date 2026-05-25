// 视频模块 API
import { api } from './index'

export interface Video {
  videoId: string
  title: string
  url: string
  coverUrl: string
  authorId: string
  authorName: string
  likeCount: number
  createdAt: string
}

export interface VideoListResponse {
  videos: Video[]
  total: number
  page: number
  pageSize: number
}

export interface UploadVideoRequest {
  title: string
  file: File
}

// 获取推荐视频流
export const getRecommendVideos = (count: number = 5) =>
  api.get<Video[]>(`/video/recommend?count=${count}`)

// 获取我的视频列表（分页）
export const getMyVideos = (page: number = 1, pageSize: number = 10) =>
  api.get<VideoListResponse>(`/video/my?page=${page}&pageSize=${pageSize}`)

// 上传视频
export const uploadVideo = async (data: UploadVideoRequest) => {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('file', data.file)

  const token = localStorage.getItem('token')
  const response = await fetch('/api/video/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  return response.json()
}

// 删除视频
export const deleteVideo = (videoId: string) =>
  api.delete(`/video/${videoId}`)

// 上报已读视频
export const reportWatched = (videoId: string) =>
  api.post('/video/watched', { videoId })
