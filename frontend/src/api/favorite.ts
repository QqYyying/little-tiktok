// 收藏相关 API
import { api, ApiResponse } from './index'
import { Video } from '@/src/types/video'

// 收藏视频
export async function favoriteVideo(videoId: string): Promise<ApiResponse<void>> {
  // TODO: 连接真实后端时替换
  return api.post(`/video/${videoId}/favorite`)
}

// 取消收藏
export async function unfavoriteVideo(videoId: string): Promise<ApiResponse<void>> {
  // TODO: 连接真实后端时替换
  return api.delete(`/video/${videoId}/favorite`)
}

// 获取收藏列表
export async function getFavorites(page = 1, pageSize = 10): Promise<ApiResponse<Video[]>> {
  // TODO: 连接真实后端时替换
  return api.get(`/user/favorites?page=${page}&pageSize=${pageSize}`)
}
