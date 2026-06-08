import { api } from '@/src/api'

export interface LikeStatus {
  videoId: string
  liked: boolean
  likeCount: number
}

export interface ILikeService {
  likeVideo(videoId: string): Promise<LikeStatus>
  unlikeVideo(videoId: string): Promise<LikeStatus>
  getLikeStatus(videoId: string): Promise<LikeStatus>
}

export async function likeVideo(videoId: string): Promise<LikeStatus> {
  const response = await api.post<LikeStatus>(`/videos/${videoId}/like`)
  return response.data
}

export async function unlikeVideo(videoId: string): Promise<LikeStatus> {
  const response = await api.delete<LikeStatus>(`/videos/${videoId}/like`)
  return response.data
}

export async function getLikeStatus(videoId: string): Promise<LikeStatus> {
  const response = await api.get<LikeStatus>(`/videos/${videoId}/like/status`)
  return response.data
}
