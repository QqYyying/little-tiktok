// 点赞模块 API
import { api } from './index'

export interface LikeStatus {
  liked: boolean
  likeCount: number
}

// 点赞视频
export const likeVideo = (videoId: string) =>
  api.post<LikeStatus>(`/like/${videoId}`)

// 取消点赞
export const unlikeVideo = (videoId: string) =>
  api.delete<LikeStatus>(`/like/${videoId}`)

// 获取点赞状态
export const getLikeStatus = (videoId: string) =>
  api.get<LikeStatus>(`/like/${videoId}/status`)
