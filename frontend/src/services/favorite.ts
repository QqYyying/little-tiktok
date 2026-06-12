import { api } from '@/src/api'

export interface FavoriteStatus {
  videoId: string
  favorited: boolean
  favoriteCount: number
}

export async function favoriteVideo(videoId: string): Promise<FavoriteStatus> {
  const response = await api.post<FavoriteStatus>(`/videos/${videoId}/favorite`)
  return response.data
}

export async function unfavoriteVideo(videoId: string): Promise<FavoriteStatus> {
  const response = await api.delete<FavoriteStatus>(`/videos/${videoId}/favorite`)
  return response.data
}

export async function getFavoriteStatus(videoId: string): Promise<FavoriteStatus> {
  const response = await api.get<FavoriteStatus>(`/videos/${videoId}/favorite/status`)
  return response.data
}
