import { api } from '@/src/api'

export interface VideoViewStatus {
  videoId: string
  viewed: boolean
}

export interface IVideoService {
  reportVideoView(videoId: string): Promise<VideoViewStatus>
}

export async function reportVideoView(videoId: string): Promise<VideoViewStatus> {
  const response = await api.post<VideoViewStatus>(`/videos/${videoId}/view`)
  return response.data
}
